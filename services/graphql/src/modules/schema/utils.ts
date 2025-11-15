import { GraphQLDateTime ,GraphQLJSON} from 'graphql-scalars';

import { asNexusMethod } from 'nexus';

export const GQLDateTime = asNexusMethod(GraphQLDateTime, 'DateTime');

export const JsonScalar = asNexusMethod(GraphQLJSON, 'json');