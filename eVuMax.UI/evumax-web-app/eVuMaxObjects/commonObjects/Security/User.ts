import { Role } from "./Role";
import * as Collections from "typescript-collections";

export class User {
  UserID: number = 0;
  UserName: string = "";
  Password: string = "";
  //Roles: Map<number, Role>;
  Roles: Collections.Dictionary<number, Role> = new Collections.Dictionary<
    number,
    Role
  >();

  LastError: string = "";

  
  isPermissonGivenAD(
    UserName: string,
    PermissionID: number,
    LastError: string
  ): boolean {
    return true;
  }

  getWellPermissionCondition(UserName: string, LastError: string): string {
    return "";
  }

  //getUserList(LastError: string): Map<number, User> {
  //    return;
  //}

  removeUser(UserID: number, LastError: string): boolean {
    return false;
  }
  //Function overloading with different number of parameters and types with same name is not supported.
  LoadObject(UserID: number, LastError: string): User {
    return new User();
  }

  LoadObjectName(UserName: string, LastError: string): User {
    return new User();
  }

  isPermissonGivenADWithLog(
    UserName: string,
    PermissionID: number,
    LastError: string,
    paramLog: string
  ): boolean {
    return false;
  }

  generateDebugLog(UserName: string): string {
    return "";
  }

  UpdateUser(): boolean {
    return true;
  }

  AddUser(LastErrors: string): boolean {
    return true;
  }
}
