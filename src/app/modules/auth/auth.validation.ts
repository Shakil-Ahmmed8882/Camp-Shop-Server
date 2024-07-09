import { z } from "zod";


const loginValidationSchema = z.object({
    body:z.object({
        id:z.string({required_error:'Id is required'}),
        password:z.string({required_error:'password is required'})
    })
})

const forgetPasswordValidationSchema = z.object({
    body:z.object({
        id:z.string({required_error:'User Id is required'})
    })
})

const resetPasswordValidationSchema = z.object({
    body:z.object({
        id:z.string({required_error:'User Id is required'}),
        newPassword:z.string({required_error:'New password is required'})
    })
})


export const AuthValidations = {
    loginValidationSchema,
    forgetPasswordValidationSchema,
    resetPasswordValidationSchema
}