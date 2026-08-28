import { Outlet } from "react-router-dom";
import { useTheme } from "../components/ThemeProvider";

export function PublicLayout() {
  const { components } = useTheme();
  const { Shell } = components;
  return (
    <Shell>
      <Outlet />
    </Shell>
  );
}
