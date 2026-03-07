"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useQuery } from "@apollo/client";
import { GET_MY_WORKSPACES } from "@/constants/query.graphql";
import { getWorkspaceId, setWorkspaceId } from "@/lib/workspace";

export type WorkspaceMember = {
  id: string;
  user_id: string;
  role: "ADMIN" | "MEMBER";
  user: {
    id: string;
    name: string;
    email: string;
    image: string;
  };
};

export type Workspace = {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  members: WorkspaceMember[];
};

type WorkspaceContextType = {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  switchWorkspace: (id: string) => void;
  loading: boolean;
  refetch: () => void;
};

const WorkspaceContext = createContext<WorkspaceContextType>({
  workspaces: [],
  currentWorkspace: null,
  switchWorkspace: () => {},
  loading: true,
  refetch: () => {},
});

export const useWorkspace = () => useContext(WorkspaceContext);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { data, loading, refetch } = useQuery(GET_MY_WORKSPACES);
  const [currentId, setCurrentId] = useState<string | null>(null);

  const workspaces: Workspace[] = data?.getMyWorkspaces || [];

  useEffect(() => {
    if (workspaces.length === 0) return;

    const savedId = getWorkspaceId();
    const exists = workspaces.find((w) => w.id === savedId);

    if (exists) {
      setCurrentId(savedId);
    } else {
      // Default to first workspace
      setCurrentId(workspaces[0].id);
      setWorkspaceId(workspaces[0].id);
    }
  }, [workspaces]);

  const switchWorkspace = (id: string) => {
    setCurrentId(id);
    setWorkspaceId(id);
  };

  const currentWorkspace = workspaces.find((w) => w.id === currentId) || null;

  return (
    <WorkspaceContext.Provider
      value={{ workspaces, currentWorkspace, switchWorkspace, loading, refetch }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}
