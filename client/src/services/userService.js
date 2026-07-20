import api from "./api";

const getProfileStats = async () => {
  const { data } = await api.get("/user/profile");
  return {
    user: {
      _id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      createdAt: data.user.createdAt,
    },
    stats: data.stats,
  };
};

const updateProfile = async (name) => {
  const { data } = await api.put("/user/profile", { name });
  return { name: data.user.name, email: data.user.email };
};

const changePassword = async (currentPassword, newPassword) => {
  const { data } = await api.put("/user/change-password", { currentPassword, newPassword });
  return data;
};

export default { getProfileStats, updateProfile, changePassword };
