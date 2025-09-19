import { createContext, useContext, useReducer, useEffect } from 'react'

const TeamContext = createContext()

const teamReducer = (state, action) => {
  switch (action.type) {
    case 'SET_TEAM':
      return {
        ...state,
        currentTeam: action.payload,
        loading: false,
        error: null,
      }
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      }
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      }
    case 'UPDATE_MEMBER':
      return {
        ...state,
        currentTeam: {
          ...state.currentTeam,
          members: state.currentTeam.members.map(member =>
            member.id === action.payload.id ? { ...member, ...action.payload.updates } : member
          ),
        },
      }
    case 'ADD_MEMBER':
      return {
        ...state,
        currentTeam: {
          ...state.currentTeam,
          members: [...state.currentTeam.members, action.payload],
        },
      }
    case 'REMOVE_MEMBER':
      return {
        ...state,
        currentTeam: {
          ...state.currentTeam,
          members: state.currentTeam.members.filter(member => member.id !== action.payload),
        },
      }
    case 'SET_TODAY_SELECTION':
      return {
        ...state,
        todaySelection: action.payload,
      }
    case 'SET_DAILY_CONTENT':
      return {
        ...state,
        dailyTip: action.payload.tip,
        dailyQuiz: action.payload.quiz,
      }
    case 'CLEAR_TEAM':
      return {
        currentTeam: null,
        todaySelection: null,
        dailyTip: null,
        dailyQuiz: null,
        loading: false,
        error: null,
      }
    default:
      return state
  }
}

const initialState = {
  currentTeam: null,
  todaySelection: null,
  dailyTip: null,
  dailyQuiz: null,
  loading: false,
  error: null,
}

export function TeamProvider({ children }) {
  const [state, dispatch] = useReducer(teamReducer, initialState)

  // Auto-refresh at midnight
  useEffect(() => {
    if (!state.currentTeam) return

    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)

    const msUntilMidnight = tomorrow.getTime() - now.getTime()

    const timeoutId = setTimeout(() => {
      // Refresh daily content at midnight
      window.location.reload()
    }, msUntilMidnight)

    return () => clearTimeout(timeoutId)
  }, [state.currentTeam])

  return (
    <TeamContext.Provider value={{ state, dispatch }}>
      {children}
    </TeamContext.Provider>
  )
}

export function useTeam() {
  const context = useContext(TeamContext)
  if (context === undefined) {
    throw new Error('useTeam must be used within a TeamProvider')
  }
  return context
}