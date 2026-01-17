import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { adminApi } from "../services/api";
import PageHeader from "../components/PageHeader";

function AdminPanel() {
  const { user } = useAuth();
  const userId = user?.id;

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resetPasswordModal, setResetPasswordModal] = useState(null); // { userId, username }
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    // Nur laden wenn Admin
    if (user?.role === "ADMIN") {
      loadUsers();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadUsers = async () => {
    try {
      const response = await adminApi.getAllUsers(userId);
      setUsers(response.data);
    } catch (error) {
      console.error("Fehler beim Laden:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (targetUserId, newRole) => {
    try {
      await adminApi.updateUserRole(targetUserId, userId, newRole);
      loadUsers();
    } catch (error) {
      console.error("Fehler beim Ändern:", error);
      alert("Fehler beim Ändern der Rolle!");
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      alert("Passwort muss mindestens 6 Zeichen haben!");
      return;
    }

    try {
      await adminApi.resetPassword(
        resetPasswordModal.userId,
        userId,
        newPassword
      );
      alert(`Passwort für ${resetPasswordModal.username} wurde zurückgesetzt!`);
      setResetPasswordModal(null);
      setNewPassword("");
    } catch (error) {
      console.error("Fehler beim Zurücksetzen:", error);
      alert("Fehler beim Zurücksetzen!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Lädt...</p>
      </div>
    );
  }

  if (user?.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-red-600 dark:text-red-400">Keine Berechtigung!</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <PageHeader title="Admin-Panel" showBack backTo="/settings" />

      <div className="p-4 space-y-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">
            User-Verwaltung
          </h2>

          <div className="space-y-3">
            {users.map((u) => (
              <div
                key={u.id}
                className="border dark:border-gray-700 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg dark:text-white">
                      {u.username}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      ID: {u.id}
                    </p>
                  </div>

                  {/* Rolle Badge */}
                  <span
                    className={`px-3 py-1 rounded text-sm font-medium ${
                      u.role === "ADMIN"
                        ? "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300"
                        : u.role === "TRUSTED_USER"
                        ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {u.role === "ADMIN"
                      ? "Admin"
                      : u.role === "TRUSTED_USER"
                      ? "Trusted User"
                      : "User"}
                  </span>
                </div>

                {/* Aktionen */}
                <div className="flex flex-wrap gap-2">
                  {/* Rolle ändern */}
                  {u.id !== userId && (
                    <>
                      <select
                        value={u.role}
                        onChange={(e) => updateRole(u.id, e.target.value)}
                        className="border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-3 py-1 text-sm"
                      >
                        <option value="USER">User</option>
                        <option value="TRUSTED_USER">Trusted User</option>
                        <option value="ADMIN">Admin</option>
                      </select>

                      <button
                        onClick={() =>
                          setResetPasswordModal({
                            userId: u.id,
                            username: u.username,
                          })
                        }
                        className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-sm"
                      >
                        Passwort zurücksetzen
                      </button>
                    </>
                  )}

                  {u.id === userId && (
                    <span className="text-sm text-gray-500 dark:text-gray-400 italic">
                      (Du selbst)
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Passwort Reset Modal */}
      {resetPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4 dark:text-white">
              Passwort zurücksetzen
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Neues Passwort für <strong>{resetPasswordModal.username}</strong>:
            </p>

            <input
              type="text"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Neues Passwort (min. 6 Zeichen)"
              className="w-full border dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-3 py-2 mb-4"
              autoFocus
            />

            <div className="flex gap-2">
              <button
                onClick={handleResetPassword}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded font-semibold"
              >
                Zurücksetzen
              </button>
              <button
                onClick={() => {
                  setResetPasswordModal(null);
                  setNewPassword("");
                }}
                className="flex-1 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-800 dark:text-white py-2 rounded font-semibold"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;
