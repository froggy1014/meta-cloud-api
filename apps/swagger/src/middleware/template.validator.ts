// import { z } from 'zod';
// import {
//     TemplateGetParams,
//     TemplateRequestBody,
//     TemplateDeleteParams,
//     LanguagesEnum,
//     CategoryEnum,
//     TemplateStatusEnum,
// } from 'meta-cloud-api/types';

// import { validate } from '../utils/validate';

// const templatesGetParamsSchema = z.object({
//     limit: z.number().optional(),
//     name: z.string().optional(),
//     language: z.nativeEnum(LanguagesEnum).optional(),
//     category: z.nativeEnum(CategoryEnum).optional(),
//     status: z.nativeEnum(TemplateStatusEnum).optional(),
// }) satisfies z.ZodType<TemplateGetParams>;

// const templateGetParamsSchema = z.object({
//     templateId: z.string(),
// }) satisfies z.ZodType<{ templateId: string }>;

// const templateCreateParamsSchema = z.object({
//     name: z.string(),
//     language: z.nativeEnum(LanguagesEnum),
//     category: z.nativeEnum(CategoryEnum),
//     components: z
//         .array(
//             z.discriminatedUnion('type', [
//                 z.object({
//                     type: z.literal('HEADER'),
//                     format: z.enum(['TEXT', 'IMAGE', 'VIDEO', 'DOCUMENT', 'LOCATION']),
//                     text: z.string().optional(),
//                     example: z
//                         .object({
//                             header_text: z.array(z.string()).optional(),
//                             header_text_named_params: z
//                                 .array(
//                                     z.object({
//                                         param_name: z.string(),
//                                         example: z.string(),
//                                     }),
//                                 )
//                                 .optional(),
//                             header_handle: z.array(z.string()).optional(),
//                         })
//                         .optional(),
//                 }),
//                 z.object({
//                     type: z.literal('BODY'),
//                     text: z.string(),
//                     example: z
//                         .object({
//                             body_text: z.array(z.array(z.string())).optional(),
//                             body_text_named_params: z
//                                 .array(
//                                     z.object({
//                                         param_name: z.string(),
//                                         example: z.string(),
//                                     }),
//                                 )
//                                 .optional(),
//                         })
//                         .optional(),
//                 }),
//                 z.object({
//                     type: z.literal('FOOTER'),
//                     text: z.string(),
//                 }),
//                 z.object({
//                     type: z.literal('PHONE_NUMBER'),
//                     text: z.string(),
//                     phone_number: z.string(),
//                 }),
//                 z.object({
//                     type: z.literal('URL'),
//                     text: z.string(),
//                     url: z.string(),
//                     example: z.array(z.string()).optional(),
//                 }),
//                 z.object({
//                     type: z.literal('QUICK_REPLY'),
//                     text: z.string(),
//                 }),
//                 z.object({
//                     type: z.literal('COPY_CODE'),
//                     example: z.string(),
//                 }),
//                 z.object({
//                     type: z.literal('FLOW'),
//                     text: z.string(),
//                     flow_id: z.string().optional(),
//                     flow_name: z.string().optional(),
//                     flow_json: z.string().optional(),
//                     flow_action: z.enum(['navigate', 'data_exchange']).optional(),
//                     navigate_screen: z.string().optional(),
//                 }),
//                 z.object({
//                     type: z.literal('MPM'),
//                 }),
//                 z.object({
//                     type: z.literal('OTP'),
//                 }),
//                 z.object({
//                     type: z.literal('SPM'),
//                 }),
//             ]),
//         )
//         .optional(),
// }) satisfies z.ZodType<TemplateRequestBody>;

// const templateDeleteParamsSchema = z
//     .object({
//         hsm_id: z.string().optional(),
//         name: z.string().optional(),
//     })
//     .refine((data) => data.hsm_id || data.name, {
//         message: 'Either hsm_id or name must be provided',
//     }) satisfies z.ZodType<TemplateDeleteParams>;

// export const templatesGetParamsValidator = validate(templatesGetParamsSchema);
// export const templateCreateParamsValidator = validate(templateCreateParamsSchema);
// export const templateUpdateParamsValidator = validate(templateCreateParamsSchema);
// export const templateDeleteParamsValidator = validate(templateDeleteParamsSchema);
// export const templateGetParamsValidator = validate(templateGetParamsSchema);
