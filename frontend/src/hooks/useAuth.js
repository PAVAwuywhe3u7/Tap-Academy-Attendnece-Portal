import { useSelector } from 'react-redux';

const useAuth = () => {
  const { user, token, loading, initialized } = useSelector((state) => state.auth);

  return {
    user,
    token,
    loading,
    initialized,
    isAuthenticated: Boolean(token)
  };
};

export default useAuth;