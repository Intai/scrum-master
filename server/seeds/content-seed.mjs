// Content seeding script
// Populates database with sample standup tips and quiz questions

import { query } from '../config/database.mjs';

// Sample standup tips
const standupTips = [
  {
    title: "Time Boxing Techniques",
    content: "Set a clear time limit for each standup discussion point. Use a visible timer to keep the meeting focused and respect everyone's schedule.",
    category: "time_management",
    difficulty: "beginner",
    target_team_size: "any"
  },
  {
    title: "Three Questions Structure",
    content: "Keep standups focused by ensuring each person answers: What did I complete yesterday? What will I work on today? What obstacles am I facing?",
    category: "facilitation",
    difficulty: "beginner",
    target_team_size: "any"
  },
  {
    title: "Walking the Board",
    content: "Instead of going person by person, walk through your kanban board or task list. This keeps focus on work items rather than individuals.",
    category: "facilitation",
    difficulty: "intermediate",
    target_team_size: "medium"
  },
  {
    title: "Parking Lot Method",
    content: "Keep a 'parking lot' for detailed discussions that arise during standup. Note them down and schedule separate time to address them.",
    category: "time_management",
    difficulty: "beginner",
    target_team_size: "any"
  },
  {
    title: "Standing Up Actually",
    content: "Encourage team members to literally stand up during the meeting. It naturally keeps the meeting shorter and more energetic.",
    category: "engagement",
    difficulty: "beginner",
    target_team_size: "small"
  },
  {
    title: "Yesterday's Wins Celebration",
    content: "Start each standup by celebrating completed tasks from yesterday. This builds team morale and acknowledges progress.",
    category: "engagement",
    difficulty: "beginner",
    target_team_size: "any"
  },
  {
    title: "Impediment Escalation",
    content: "If an impediment mentioned in standup isn't resolved within 24 hours, automatically escalate it to management or product owner.",
    category: "problem_solving",
    difficulty: "intermediate",
    target_team_size: "any"
  },
  {
    title: "Silent Start",
    content: "Begin standups with 2 minutes of silent preparation time where everyone reviews their notes and plans what to share.",
    category: "facilitation",
    difficulty: "intermediate",
    target_team_size: "any"
  },
  {
    title: "Token Passing",
    content: "Use a physical or virtual token that team members pass to indicate whose turn it is to speak. This helps with remote meetings.",
    category: "facilitation",
    difficulty: "beginner",
    target_team_size: "small"
  },
  {
    title: "Goal Alignment Check",
    content: "Weekly, spend one standup reviewing whether daily tasks align with sprint goals. Adjust priorities if needed.",
    category: "problem_solving",
    difficulty: "advanced",
    target_team_size: "any"
  },
  {
    title: "Async Updates",
    content: "For routine updates, use async channels (Slack, email) and reserve standup time for blockers and collaboration needs.",
    category: "time_management",
    difficulty: "intermediate",
    target_team_size: "large"
  },
  {
    title: "Retrospective Minutes",
    content: "Spend the last minute of each standup doing a micro-retrospective: What's working well? What could be improved?",
    category: "retrospectives",
    difficulty: "intermediate",
    target_team_size: "any"
  },
  {
    title: "Visual Mood Check",
    content: "Start with a quick mood check using emojis or colored cards. This helps gauge team energy and identify when someone needs support.",
    category: "engagement",
    difficulty: "beginner",
    target_team_size: "any"
  },
  {
    title: "Pair Programming Plans",
    content: "Use standup to identify opportunities for pair programming or collaboration on challenging tasks mentioned as blockers.",
    category: "problem_solving",
    difficulty: "intermediate",
    target_team_size: "small"
  },
  {
    title: "Definition of Done Review",
    content: "Periodically review your definition of done during standup to ensure everyone understands what 'complete' means.",
    category: "facilitation",
    difficulty: "advanced",
    target_team_size: "any"
  }
];

// Sample quiz questions
const quizQuestions = [
  {
    question: "What does the acronym 'SOLID' represent in software engineering?",
    correct_answer: "Single responsibility, Open-closed, Liskov substitution, Interface segregation, Dependency inversion",
    options: JSON.stringify([
      "Single responsibility, Open-closed, Liskov substitution, Interface segregation, Dependency inversion",
      "Simple objects, Limited interfaces, Direct dependencies",
      "Structured programming principles",
      "Software optimization guidelines"
    ]),
    category: "software_engineering",
    difficulty: "medium",
    explanation: "SOLID represents five fundamental principles of object-oriented design that make software more maintainable and flexible."
  },
  {
    question: "In Agile methodology, what is the recommended length for a sprint?",
    correct_answer: "1-4 weeks",
    options: JSON.stringify([
      "1-4 weeks",
      "1-2 months",
      "6 months",
      "1 year"
    ]),
    category: "agile",
    difficulty: "easy",
    explanation: "Agile recommends short iterations of 1-4 weeks to allow for frequent feedback and adaptation."
  },
  {
    question: "What is the main purpose of a daily standup meeting?",
    correct_answer: "Synchronize team activities and identify blockers",
    options: JSON.stringify([
      "Synchronize team activities and identify blockers",
      "Conduct detailed code reviews",
      "Plan the entire sprint",
      "Report to management"
    ]),
    category: "agile",
    difficulty: "easy",
    explanation: "Daily standups are meant to keep the team synchronized and quickly identify any obstacles to progress."
  },
  {
    question: "Which data structure uses LIFO (Last In, First Out) principle?",
    correct_answer: "Stack",
    options: JSON.stringify([
      "Stack",
      "Queue",
      "Array",
      "Hash Table"
    ]),
    category: "tech",
    difficulty: "easy",
    explanation: "A stack follows the LIFO principle where the last element added is the first one to be removed."
  },
  {
    question: "What is the time complexity of binary search?",
    correct_answer: "O(log n)",
    options: JSON.stringify([
      "O(log n)",
      "O(n)",
      "O(n²)",
      "O(1)"
    ]),
    category: "tech",
    difficulty: "medium",
    explanation: "Binary search divides the search space in half with each step, resulting in logarithmic time complexity."
  },
  {
    question: "In team building, what is psychological safety?",
    correct_answer: "The belief that you can speak up without risk of punishment or humiliation",
    options: JSON.stringify([
      "The belief that you can speak up without risk of punishment or humiliation",
      "Physical safety measures in the workplace",
      "Job security and stable employment",
      "Emotional support from management"
    ]),
    category: "team_building",
    difficulty: "medium",
    explanation: "Psychological safety is crucial for innovation and learning, allowing team members to share ideas and mistakes openly."
  },
  {
    question: "What is the primary goal of a retrospective meeting?",
    correct_answer: "Improve team processes and collaboration",
    options: JSON.stringify([
      "Improve team processes and collaboration",
      "Review individual performance",
      "Plan future features",
      "Assign blame for problems"
    ]),
    category: "agile",
    difficulty: "easy",
    explanation: "Retrospectives focus on continuous improvement of team processes and working relationships."
  },
  {
    question: "Which HTTP status code indicates a successful POST request that created a resource?",
    correct_answer: "201 Created",
    options: JSON.stringify([
      "201 Created",
      "200 OK",
      "204 No Content",
      "202 Accepted"
    ]),
    category: "tech",
    difficulty: "medium",
    explanation: "201 Created specifically indicates that a request was successful and resulted in the creation of a new resource."
  },
  {
    question: "What is the recommended maximum size for a Scrum team?",
    correct_answer: "10 people",
    options: JSON.stringify([
      "10 people",
      "15 people",
      "20 people",
      "No limit"
    ]),
    category: "agile",
    difficulty: "easy",
    explanation: "Scrum recommends keeping teams small (typically 3-9 people) to maintain effective communication and collaboration."
  },
  {
    question: "In software testing, what is a 'mock'?",
    correct_answer: "A fake object that simulates real object behavior for testing",
    options: JSON.stringify([
      "A fake object that simulates real object behavior for testing",
      "A type of integration test",
      "A debugging tool",
      "A performance measurement"
    ]),
    category: "tech",
    difficulty: "medium",
    explanation: "Mocks are test doubles that simulate the behavior of real objects, allowing isolated unit testing."
  },
  {
    question: "What does MVP stand for in product development?",
    correct_answer: "Minimum Viable Product",
    options: JSON.stringify([
      "Minimum Viable Product",
      "Most Valuable Player",
      "Maximum Value Proposition",
      "Minimum Value Performance"
    ]),
    category: "general",
    difficulty: "easy",
    explanation: "MVP is a product with just enough features to satisfy early customers and provide feedback for future development."
  },
  {
    question: "Which principle suggests that 80% of effects come from 20% of causes?",
    correct_answer: "Pareto Principle",
    options: JSON.stringify([
      "Pareto Principle",
      "Murphy's Law",
      "Conway's Law",
      "Peter Principle"
    ]),
    category: "general",
    difficulty: "medium",
    explanation: "The Pareto Principle, also known as the 80/20 rule, is widely applicable in business and software development."
  }
];

export const seedContent = async () => {
  try {
    console.log('Seeding standup tips...');

    // Insert standup tips
    for (const tip of standupTips) {
      // Check if tip already exists
      const existing = await query('SELECT id FROM standup_tips WHERE title = $1', [tip.title]);
      if (existing.rows.length === 0) {
        await query(`
          INSERT INTO standup_tips (title, content, category, difficulty, target_team_size)
          VALUES ($1, $2, $3, $4, $5)
        `, [tip.title, tip.content, tip.category, tip.difficulty, tip.target_team_size]);
      }
    }

    console.log(`✓ Inserted ${standupTips.length} standup tips`);

    console.log('Seeding quiz questions...');

    // Insert quiz questions
    for (const question of quizQuestions) {
      // Check if question already exists
      const existing = await query('SELECT id FROM quiz_questions WHERE question = $1', [question.question]);
      if (existing.rows.length === 0) {
        await query(`
          INSERT INTO quiz_questions (question, correct_answer, options, category, difficulty, explanation)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [question.question, question.correct_answer, question.options, question.category, question.difficulty, question.explanation]);
      }
    }

    console.log(`✓ Inserted ${quizQuestions.length} quiz questions`);
    console.log('Content seeding completed successfully!');

  } catch (error) {
    console.error('Error seeding content:', error);
    throw error;
  }
};

// Run seeding if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  import('../config/database.mjs').then(({ closePool }) => {
    seedContent()
      .then(() => {
        console.log('Seeding completed');
        closePool();
      })
      .catch((error) => {
        console.error('Seeding failed:', error);
        closePool();
        process.exit(1);
      });
  });
}