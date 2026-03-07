import { gql } from "@apollo/client";


export const GET_ME = gql`
  query GetMe {
    getMe {
      id
      name
      email
      role
      created_at
      updated_at
    }
  }
`;

export const GET_MY_WORKSPACES = gql`
  query GetMyWorkspaces {
    getMyWorkspaces {
      id
      name
      created_by
      created_at
      members {
        id
        user_id
        role
        user {
          id
          name
          email
          image
        }
      }
    }
  }
`;

export const GET_WORKSPACE_MEMBERS = gql`
  query GetWorkspaceMembers($workspace_id: String!) {
    getWorkspaceMembers(workspace_id: $workspace_id) {
      id
      user_id
      role
      created_at
      user {
        id
        name
        email
        image
      }
    }
  }
`;

export const GET_WORKSPACE_INVITATIONS = gql`
  query GetWorkspaceInvitations($workspace_id: String!) {
    getWorkspaceInvitations(workspace_id: $workspace_id) {
      id
      email
      role
      accepted
      created_at
      expires_at
    }
  }
`;

export const CREATE_WORKSPACE = gql`
  mutation CreateWorkspace($name: String!) {
    createWorkspace(name: $name) {
      id
      name
    }
  }
`;

export const INVITE_TO_WORKSPACE = gql`
  mutation InviteToWorkspace($workspace_id: String!, $email: String!, $role: WorkspaceRole) {
    inviteToWorkspace(workspace_id: $workspace_id, email: $email, role: $role) {
      id
      email
      role
      token
    }
  }
`;

export const ACCEPT_INVITATION = gql`
  mutation AcceptInvitation($token: String!) {
    acceptInvitation(token: $token) {
      id
      workspace_id
      role
    }
  }
`;

export const REMOVE_MEMBER = gql`
  mutation RemoveMember($workspace_id: String!, $user_id: String!) {
    removeMember(workspace_id: $workspace_id, user_id: $user_id) {
      id
    }
  }
`;

export const UPDATE_MEMBER_ROLE = gql`
  mutation UpdateMemberRole($workspace_id: String!, $user_id: String!, $role: WorkspaceRole!) {
    updateMemberRole(workspace_id: $workspace_id, user_id: $user_id, role: $role) {
      id
      role
    }
  }
`;
