import { useLocation, Route, RouteProps } from "wouter";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface ProtectedRouteProps extends RouteProps {
    permission?: string;
}

export function ProtectedRoute({ permission, ...props }: ProtectedRouteProps) {
    const [location, setLocation] = useLocation();
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [hasAccess, setHasAccess] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("token");
        const userStr = localStorage.getItem("user");

        if (token && token !== "undefined" && token !== "null") {
            setIsAuthenticated(true);

            if (permission) {
                const user = userStr ? JSON.parse(userStr) : null;
                const permissions = user?.permissions || [];
                const role = user?.role;

                if (role === 'Owner' || permissions.includes(permission)) {
                    setHasAccess(true);
                } else {
                    setHasAccess(false);
                    // Redirect to dashboard if no access
                    if (location !== "/") {
                        setLocation("/");
                    }
                }
            } else {
                setHasAccess(true);
            }
        } else {
            setIsAuthenticated(false);
            if (location !== "/auth") {
                setLocation("/auth");
            }
        }
        setIsLoading(false);
    }, [location, setLocation, permission]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (isAuthenticated && hasAccess) {
        return <Route {...props} />;
    }

    return null;
}
