import * as Yup from "yup";
import { encrypt } from "../utils/encryption";
import { ROLES } from "../utils/constant";

const validatePassword = Yup.string()
  .required()
  .min(6, "Password must be at least 6 characters")
  .test(
    "at-least-one-uppercase-letter",
    "Contains at least one uppercase letter",
    (value) => {
      if (!value) return false;
      const regex = /^(?=.*[A-Z])/;
      return regex.test(value);
    }
  )
  .test(
    "at-least-one-number",
    "Contains at least one uppercase letter",
    (value) => {
      if (!value) return false;
      const regex = /^(?=.*\d)/;
      return regex.test(value);
    }
  );
const validateConfirmPassword = Yup.string()
  .required()
  .oneOf([Yup.ref("password"), ""], "Password not match");

export const USER_MODEL_NAME = "User";

export const userUpdatePasswordDTO = Yup.object({
  oldPassword: validatePassword,
  password: validatePassword,
  confirmPassword: validateConfirmPassword,
});

export const userDTO = Yup.object({
  fullName: Yup.string().required(),
  username: Yup.string().required(),
  password: validatePassword,
  confirmPassword: validateConfirmPassword,
});

export const userLoginDTO = Yup.object({
  identifier: Yup.string().required(),
  password: validatePassword,
});

export const userAddDTO = Yup.object({
  fullName: Yup.string().required(),
  username: Yup.string().required(),
  password: validatePassword,
  confirmPassword: validateConfirmPassword,
  role: Yup.string()
    .oneOf([ROLES.ADMIN, ROLES.SUPERADMIN, ROLES.DAERAH, ROLES.SUBDAERAH, ROLES.DESA, ROLES.SUBDESA, ROLES.KELOMPOK, ROLES.SUBKELOMPOK])
    .required("Role harus dipilih"),
  avatar: Yup.string().nullable(),
});

export type TypeUser = Yup.InferType<typeof userDTO>;

export interface User extends Omit<TypeUser, "confirmPassword"> {
  role: string;
  createdAt?: string;
}
