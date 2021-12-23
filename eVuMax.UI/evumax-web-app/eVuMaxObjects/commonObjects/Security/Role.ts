import { RolePermission } from "./RolePermission";
import { RoleWellPermission } from "./RoleWellPermission";
import * as Collections from "typescript-collections";

export class Role {
  RoleID: number = 0;
  RoleName: string = "";
  //RolePermissions: Map<number, RolePermission>;
  //WellPermissions: Map<number, RoleWellPermission>;
  RolePermissions: Collections.Dictionary<number, RolePermission> = new Collections.Dictionary<number, RolePermission>();

  WellPermissions: Collections.Dictionary<
    number,
    Role
  > = new Collections.Dictionary<number, Role>();
  LastError: string = "";

}
