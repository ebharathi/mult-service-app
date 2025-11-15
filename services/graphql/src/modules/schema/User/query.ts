import { extendType, nonNull, stringArg } from "nexus";


export const UserQuery = extendType({
    type: "Query",
    definition(t){
        t.field("getMe",{
            type: "users",
         
            resolve: async (_,_args,ctx)=>{
                return ctx.prisma.users.findUnique({
                    where:{
                        id:ctx.user.userId
                    }
                })
            }
        })
    }
})