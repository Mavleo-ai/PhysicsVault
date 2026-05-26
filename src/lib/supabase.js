import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabaseInstance = null;

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  } catch (error) {
    console.error("Failed to initialize Supabase client:", error);
  }
}

// Mock auth with full subscriber tier storage (localStorage persistent)
const mockAuth = {
  signUp: async ({ email, password }) => {
    await new Promise((r) => setTimeout(r, 600));

    if (!email || !password) {
      return { data: { user: null }, error: { message: "Email and password are required." } };
    }

    const users = JSON.parse(localStorage.getItem("pv_mock_users") || "[]");
    if (users.some((u) => u.email === email)) {
      return { data: { user: null }, error: { message: "An account with this email already exists." } };
    }

    const newUser = { 
      id: `usr_${Math.random().toString(36).substr(2, 9)}`, 
      email,
      tier: "free" 
    };
    users.push({ ...newUser, password });
    localStorage.setItem("pv_mock_users", JSON.stringify(users));
    localStorage.setItem("pv_active_user", JSON.stringify(newUser));

    return { data: { user: newUser }, error: null };
  },

  signInWithPassword: async ({ email, password }) => {
    await new Promise((r) => setTimeout(r, 600));

    const users = JSON.parse(localStorage.getItem("pv_mock_users") || "[]");
    const matchedUser = users.find((u) => u.email === email && u.password === password);

    if (!matchedUser) {
      return { data: { user: null }, error: { message: "Invalid email or password credential." } };
    }

    const userSession = { 
      id: matchedUser.id, 
      email: matchedUser.email,
      tier: matchedUser.tier || "free"
    };
    localStorage.setItem("pv_active_user", JSON.stringify(userSession));

    return { data: { user: userSession }, error: null };
  },

  signOut: async () => {
    localStorage.removeItem("pv_active_user");
    return { error: null };
  },

  getUser: async () => {
    if (typeof window === "undefined") return { data: { user: null } };
    const userSession = localStorage.getItem("pv_active_user");
    if (!userSession) return { data: { user: null } };
    return { data: { user: JSON.parse(userSession) }, error: null };
  },

  // Premium database callback to upgrade study clearance level upon Razorpay completion
  upgradeUserTier: async (tier) => {
    if (typeof window === "undefined") return { error: "No window context" };
    
    const activeUserStr = localStorage.getItem("pv_active_user");
    if (!activeUserStr) return { error: "User not logged in" };
    
    const activeUser = JSON.parse(activeUserStr);
    activeUser.tier = tier;
    localStorage.setItem("pv_active_user", JSON.stringify(activeUser));

    // Update in mock database list as well
    const users = JSON.parse(localStorage.getItem("pv_mock_users") || "[]");
    const updatedUsers = users.map((u) => {
      if (u.email === activeUser.email) {
        return { ...u, tier };
      }
      return u;
    });
    localStorage.setItem("pv_mock_users", JSON.stringify(updatedUsers));

    return { data: { user: activeUser }, error: null };
  }
};

export const supabase = supabaseInstance || {
  auth: mockAuth,
  isMock: true
};
