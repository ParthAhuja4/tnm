const { isAuthenticated, changeAuthentication, userSet, changeLoading } =
  useAuth();
const navigate = useNavigate();

// First useEffect to check token and handle user data
useEffect(() => {
  // Start loading state when checking authentication
  changeLoading(true);

  // Check if token exists in localStorage
  const token = localStorage.getItem("token");

  if (token) {
    // Token exists, so user is authenticated
    const userData: User | null = JSON.parse(
      localStorage.getItem("user") || "null"
    );
    userSet(userData);
    changeAuthentication(true); // Mark user as authenticated
  } else {
    // No token, user is not authenticated
    changeAuthentication(false); // Mark user as not authenticated
  }

  // Stop loading after checking authentication status
  changeLoading(false);
}, []); // This runs only on mount

// Second useEffect to navigate when authentication status changes
useEffect(() => {
  // If user is not authenticated, redirect to login page
  if (!isAuthenticated) {
    navigate("/login");
  }
}, [isAuthenticated, navigate]); // Trigger navigation when isAuthenticated changes

// Return the Dashboard if authenticated, otherwise nothing is rendered
if (isAuthenticated === null || isAuthenticated === undefined) {
  // Return nothing or a loading spinner until we determine authentication status
  return <div>Loading...</div>;
}
