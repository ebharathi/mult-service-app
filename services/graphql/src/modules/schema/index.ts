import { makeSchema } from "nexus"
import { join } from "path"
import * as Utils from "./utils"
import * as UserSchemas from "./User"


export const schema = makeSchema({
  types: [ 
    ...Object.values(Utils),
    ...Object.values(UserSchemas),
 ],
  outputs: {
    schema: join(process.cwd(), "src/modules/generated/schema.graphql"),
    typegen: join(process.cwd(), "src/modules/generated/nexus-typegen.ts"),
  },
  contextType: {
    module: join(process.cwd(), "src/modules", "context.ts"),
    export: "Context",
  },
})
