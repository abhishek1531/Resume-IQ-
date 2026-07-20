import api from "./api";

// Backend (server/controllers/authController.js) returns the user as
// { id, name, email, createdAt } and the token separately. The frontend
// AuthContext expects a flat { _id, name, email, token } shape, so we
// normalize the response here rather than touching AuthContext/UI.
const mapUser = (user) => ({
  _id: user.id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
});

const signup = async (name, email, password) => {
  // Backend route is /auth/register, not /auth/signup
  const { data } = await api.post("/auth/register", { name, email, password });
  return { token: data.token, ...mapUser(data.user) };
};

const login = async (email, password, rememberMe) => {
  // rememberMe isn't used by the backend (JWT is stateless either way),
  // but we still send it in case a future backend wants to vary token
  // expiry by it - harmless extra field otherwise.
  const { data } = await api.post("/auth/login", { email, password, rememberMe });
  return { token: data.token, ...mapUser(data.user) };
};

const getMe = async () => {
  const { data } = await api.get("/auth/me");
  return mapUser(data.user);
};

const logout = async () => {
  // Auth is stateless JWT with no server-side session, so there's nothing
  // to invalidate on the backend (no /auth/logout route exists). Token
  // removal happens client-side in AuthContext right after this resolves.
  return Promise.resolve();
};

export default { signup, login, getMe, logout };
