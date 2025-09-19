// Migration: Create views and stored functions
// Based on database-design.md specification

export const up = async (query) => {
  // Create active_team_members view
  await query(`
    CREATE VIEW active_team_members AS
    SELECT
      m.id,
      m.team_id,
      m.name,
      m.position,
      m.joined_at,
      m.last_selected_at,
      CASE
        WHEN EXISTS (
          SELECT 1 FROM availability_periods ap
          WHERE ap.member_id = m.id
          AND ap.is_active = TRUE
          AND CURRENT_DATE BETWEEN ap.start_date AND COALESCE(ap.end_date, CURRENT_DATE)
        ) THEN FALSE
        ELSE TRUE
      END AS is_available_today,
      COALESCE(
        (SELECT COUNT(*) FROM selections s WHERE s.member_id = m.id),
        0
      ) AS total_selections,
      COALESCE(
        CURRENT_DATE - (SELECT MAX(s.selected_date) FROM selections s WHERE s.member_id = m.id),
        999
      ) AS days_since_last_selection
    FROM members m
    WHERE m.is_active = TRUE;
  `);

  // Create team_fairness_metrics view
  await query(`
    CREATE VIEW team_fairness_metrics AS
    SELECT
      t.id AS team_id,
      t.name AS team_name,
      COUNT(m.id) AS active_members,
      COALESCE(AVG(atm.total_selections), 0) AS avg_selections_per_member,
      COALESCE(STDDEV(atm.total_selections), 0) AS selection_std_deviation,
      CASE
        WHEN COUNT(m.id) > 0 AND STDDEV(atm.total_selections) > 0
        THEN 1 - (STDDEV(atm.total_selections) / NULLIF(AVG(atm.total_selections), 0))
        ELSE 1
      END AS fairness_coefficient
    FROM teams t
    JOIN members m ON t.id = m.team_id AND m.is_active = TRUE
    LEFT JOIN active_team_members atm ON m.id = atm.id
    WHERE t.is_archived = FALSE
    GROUP BY t.id, t.name;
  `);

  // Create get_next_scrum_master function
  await query(`
    CREATE OR REPLACE FUNCTION get_next_scrum_master(p_team_id VARCHAR(8), p_target_date DATE DEFAULT CURRENT_DATE)
    RETURNS TABLE (
      member_id UUID,
      member_name VARCHAR(30),
      selection_method VARCHAR(20),
      confidence VARCHAR(10)
    )
    LANGUAGE plpgsql
    AS $$
    DECLARE
      v_queue_record rotation_queues%ROWTYPE;
      v_available_members UUID[];
      v_selected_member_id UUID;
      v_selected_member_name VARCHAR(30);
      v_method VARCHAR(20) := 'automatic';
      v_confidence VARCHAR(10) := 'high';
    BEGIN
      -- Get rotation queue for team
      SELECT * INTO v_queue_record
      FROM rotation_queues
      WHERE team_id = p_team_id;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'No rotation queue found for team %', p_team_id;
      END IF;

      -- Get available members for target date
      WITH available_members AS (
        SELECT m.id
        FROM members m
        WHERE m.team_id = p_team_id
        AND m.is_active = TRUE
        AND NOT EXISTS (
          SELECT 1 FROM availability_periods ap
          WHERE ap.member_id = m.id
          AND ap.is_active = TRUE
          AND p_target_date BETWEEN ap.start_date AND COALESCE(ap.end_date, p_target_date)
        )
        ORDER BY m.position
      )
      SELECT ARRAY_AGG(id) INTO v_available_members FROM available_members;

      -- Handle edge cases
      IF array_length(v_available_members, 1) IS NULL THEN
        RETURN QUERY SELECT NULL::UUID, 'No one available'::VARCHAR(30), 'automatic'::VARCHAR(20), 'low'::VARCHAR(10);
        RETURN;
      END IF;

      IF array_length(v_available_members, 1) = 1 THEN
        v_confidence := 'medium';
      END IF;

      -- Find next available member in queue order
      FOR i IN 0..jsonb_array_length(v_queue_record.queue_order)-1 LOOP
        v_selected_member_id := (v_queue_record.queue_order->>((v_queue_record.current_position + i) % jsonb_array_length(v_queue_record.queue_order)))::UUID;

        IF v_selected_member_id = ANY(v_available_members) THEN
          EXIT;
        END IF;
      END LOOP;

      -- Get member name
      SELECT name INTO v_selected_member_name
      FROM members
      WHERE id = v_selected_member_id;

      RETURN QUERY SELECT v_selected_member_id, v_selected_member_name, v_method, v_confidence;
    END;
    $$;
  `);

  // Create record_selection function
  await query(`
    CREATE OR REPLACE FUNCTION record_selection(
      p_team_id VARCHAR(8),
      p_member_id UUID,
      p_selected_date DATE DEFAULT CURRENT_DATE,
      p_method VARCHAR(20) DEFAULT 'automatic',
      p_skip_reason TEXT DEFAULT NULL
    )
    RETURNS UUID
    LANGUAGE plpgsql
    AS $$
    DECLARE
      v_selection_id UUID;
      v_queue_record rotation_queues%ROWTYPE;
      v_member_position INTEGER;
      v_new_position INTEGER;
    BEGIN
      -- Check if selection already exists for this date
      IF EXISTS (SELECT 1 FROM selections WHERE team_id = p_team_id AND selected_date = p_selected_date) THEN
        RAISE EXCEPTION 'Selection already exists for team % on date %', p_team_id, p_selected_date;
      END IF;

      -- Record the selection
      INSERT INTO selections (team_id, member_id, selected_date, selection_method, skip_reason)
      VALUES (p_team_id, p_member_id, p_selected_date, p_method, p_skip_reason)
      RETURNING id INTO v_selection_id;

      -- Update member's last selected timestamp
      UPDATE members
      SET last_selected_at = NOW()
      WHERE id = p_member_id;

      -- Update rotation queue
      SELECT * INTO v_queue_record FROM rotation_queues WHERE team_id = p_team_id;

      -- Find member position in queue
      FOR i IN 0..jsonb_array_length(v_queue_record.queue_order)-1 LOOP
        IF (v_queue_record.queue_order->>i)::UUID = p_member_id THEN
          v_member_position := i;
          EXIT;
        END IF;
      END LOOP;

      -- Calculate new queue position (next after selected member)
      v_new_position := (v_member_position + 1) % jsonb_array_length(v_queue_record.queue_order);

      -- Update rotation queue
      UPDATE rotation_queues
      SET
        current_position = v_new_position,
        total_selections = total_selections + 1
      WHERE team_id = p_team_id;

      RETURN v_selection_id;
    END;
    $$;
  `);

  console.log('Views and stored functions created successfully');
};

export const down = async (query) => {
  await query('DROP FUNCTION IF EXISTS record_selection(VARCHAR(8), UUID, DATE, VARCHAR(20), TEXT);');
  await query('DROP FUNCTION IF EXISTS get_next_scrum_master(VARCHAR(8), DATE);');
  await query('DROP VIEW IF EXISTS team_fairness_metrics;');
  await query('DROP VIEW IF EXISTS active_team_members;');
  console.log('Views and stored functions dropped');
};