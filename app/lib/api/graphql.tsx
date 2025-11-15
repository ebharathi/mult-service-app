"use client";

import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { loadErrorMessages, loadDevMessages } from "@apollo/client/dev";
import { ReactNode } from "react";
import { CORE_SERVICE } from "@/constants/api.constant";

const GRAPHQL_API = CORE_SERVICE + "/api/graphql";

if (process.env.NODE_ENV !== "production") {
  loadDevMessages();
  loadErrorMessages();
}

// Base GraphQL link
const httpLink = createHttpLink({
  uri: GRAPHQL_API,
  credentials: "include",
});

// Middleware to inject headers
const authLink = setContext(async (_, { headers }) => {
  if (typeof window !== "undefined") {
    //to get something from page url
  }

  return {
    headers: {
      ...headers,
    },
  };
});

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

export function Apollo({ children }: { children: ReactNode }) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}

