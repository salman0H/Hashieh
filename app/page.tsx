import { authorized, configured } from "./lib/auth";
import { appModel } from "./lib/repository";
import Workspace from "./components/Workspace";
import Login from "./components/Login";
export const dynamic = "force-dynamic";
export default async function Page() {
  if (!(await authorized())) return <Login configured={configured()} />;
  return <Workspace model={appModel()} />;
}
