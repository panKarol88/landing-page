import { Outlet } from "react-router-dom";
import { useTheme } from "../components/ThemeProvider";

export function PublicLayout() {
  const { Shell } = useTheme();
  return <Shell><Outlet /></Shell>;
}
