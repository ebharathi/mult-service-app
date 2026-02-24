import { enumType, objectType } from "nexus"
import * as np from "nexus-prisma";


export const RoleType = enumType(np.Role)

export const UserType = objectType({
    name: np.users.$name,
    definition(t) {
        t.field(np.users.id)
        t.field(np.users.email)
        t.field(np.users.name)
        t.field(np.users.image)
        t.field(np.users.role)
        t.field(np.users.created_at)
        t.field(np.users.updated_at)
        t.field(np.users.google_id)
        t.field(np.users.utm_source)
    }
})