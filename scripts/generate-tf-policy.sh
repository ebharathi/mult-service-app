#!/usr/bin/env bash
set -euo pipefail

# Generate a Terraform execution IAM policy JSON for any project.
#
# Usage:
#   ./scripts/generate-tf-policy.sh <project_name> <s3_bucket_name> [output_file]
#
# Examples:
#   ./scripts/generate-tf-policy.sh outreach outreach-tf-state-bucket
#   ./scripts/generate-tf-policy.sh myapp myapp-tf-state-bucket policy.json

PROJECT_NAME="${1:?Usage: $0 <project_name> <s3_bucket_name> [output_file]}"
S3_BUCKET="${2:?Usage: $0 <project_name> <s3_bucket_name> [output_file]}"
OUTPUT_FILE="${3:-${PROJECT_NAME}_terraform_execution_policy.json}"

cat > "$OUTPUT_FILE" <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "EC2DescribeActions",
            "Effect": "Allow",
            "Action": [
                "ec2:Describe*",
                "ec2:Get*",
                "ec2:List*"
            ],
            "Resource": "*"
        },
        {
            "Sid": "EC2CreateAndModify",
            "Effect": "Allow",
            "Action": [
                "ec2:CreateVpc",
                "ec2:ModifyVpcAttribute",
                "ec2:CreateSubnet",
                "ec2:ModifySubnetAttribute",
                "ec2:CreateInternetGateway",
                "ec2:AttachInternetGateway",
                "ec2:DetachInternetGateway",
                "ec2:CreateRouteTable",
                "ec2:CreateRoute",
                "ec2:AssociateRouteTable",
                "ec2:DisassociateRouteTable",
                "ec2:CreateSecurityGroup",
                "ec2:AuthorizeSecurityGroupIngress",
                "ec2:AuthorizeSecurityGroupEgress",
                "ec2:RevokeSecurityGroupIngress",
                "ec2:RevokeSecurityGroupEgress",
                "ec2:RunInstances",
                "ec2:StartInstances",
                "ec2:StopInstances",
                "ec2:AllocateAddress",
                "ec2:AssociateAddress",
                "ec2:DisassociateAddress",
                "ec2:CreateTags",
                "ec2:CreateNetworkAclEntry",
                "ec2:DeleteNetworkAclEntry",
                "ec2:ReplaceNetworkAclEntry",
                "ec2:DescribeNetworkAcls",
                "ec2:ModifyInstanceAttribute"
            ],
            "Resource": "*",
            "Condition": {
                "StringEquals": {
                    "aws:RequestedRegion": "us-east-1"
                }
            }
        },
        {
            "Sid": "EC2DeleteTagScoped",
            "Effect": "Allow",
            "Action": [
                "ec2:DeleteVpc",
                "ec2:DeleteSubnet",
                "ec2:DeleteInternetGateway",
                "ec2:DeleteRouteTable",
                "ec2:DeleteRoute",
                "ec2:DeleteSecurityGroup",
                "ec2:TerminateInstances",
                "ec2:ReleaseAddress",
                "ec2:DeleteTags"
            ],
            "Resource": "*",
            "Condition": {
                "StringLike": {
                    "ec2:ResourceTag/Name": "${PROJECT_NAME}*"
                }
            }
        },
        {
            "Sid": "RDSMinimal",
            "Effect": "Allow",
            "Action": [
                "rds:CreateDBInstance",
                "rds:DeleteDBInstance",
                "rds:ModifyDBInstance",
                "rds:DescribeDBParameters",
                "rds:CreateDBSubnetGroup",
                "rds:DeleteDBSubnetGroup",
                "rds:DescribeDBSubnetGroups",
                "rds:CreateDBParameterGroup",
                "rds:ModifyDBParameterGroup",
                "rds:DeleteDBParameterGroup",
                "rds:DescribeDBParameterGroups",
                "rds:AddTagsToResource",
                "rds:ListTagsForResource"
            ],
            "Resource": [
                "arn:aws:rds:us-east-1:*:db:${PROJECT_NAME}*",
                "arn:aws:rds:us-east-1:*:pg:${PROJECT_NAME}*",
                "arn:aws:rds:us-east-1:*:subgrp:${PROJECT_NAME}*",
                "arn:aws:rds:us-east-1:*:snapshot:${PROJECT_NAME}*"
            ]
        },
        {
            "Sid": "RDSDescribe",
            "Effect": "Allow",
            "Action": [
                "rds:DescribeDBInstances"
            ],
            "Resource": "*"
        },
        {
            "Sid": "IAMRoleForRDS",
            "Effect": "Allow",
            "Action": [
                "iam:CreateRole",
                "iam:DeleteRole",
                "iam:GetRole",
                "iam:PassRole",
                "iam:AttachRolePolicy",
                "iam:DetachRolePolicy",
                "iam:ListAttachedRolePolicies",
                "iam:TagRole",
                "iam:UntagRole",
                "iam:GetRolePolicy"
            ],
            "Resource": [
                "arn:aws:iam::*:role/${PROJECT_NAME}*",
                "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
            ]
        },
        {
            "Sid": "RDSServiceLinkedRole",
            "Effect": "Allow",
            "Action": [
                "iam:CreateServiceLinkedRole",
                "iam:ListRoles"
            ],
            "Resource": "arn:aws:iam::*:role/aws-service-role/rds.amazonaws.com/AWSServiceRoleForRDS"
        },
        {
            "Sid": "IAMReadOnly",
            "Effect": "Allow",
            "Action": [
                "iam:GetRole",
                "iam:ListRoles",
                "iam:GetPolicy",
                "iam:ListPolicies"
            ],
            "Resource": "*"
        },
        {
            "Sid": "TerraformStateS3Access",
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::${S3_BUCKET}",
                "arn:aws:s3:::${S3_BUCKET}/*"
            ]
        },
        {
            "Sid": "KMSForRDS",
            "Effect": "Allow",
            "Action": [
                "kms:Encrypt",
                "kms:Decrypt",
                "kms:DescribeKey",
                "kms:CreateGrant",
                "kms:CreateKey",
                "kms:CreateAlias",
                "kms:ScheduleKeyDeletion",
                "kms:EnableKeyRotation",
                "kms:GetKeyRotationStatus",
                "kms:GetKeyPolicy",
                "kms:ListResourceTags",
                "kms:TagResource",
                "kms:UntagResource"
            ],
            "Resource": "*"
        },
        {
            "Sid": "SecretsManager",
            "Effect": "Allow",
            "Action": [
                "secretsmanager:CreateSecret",
                "secretsmanager:DescribeSecret",
                "secretsmanager:DeleteSecret",
                "secretsmanager:PutSecretValue",
                "secretsmanager:GetSecretValue",
                "secretsmanager:TagResource",
                "secretsmanager:UntagResource",
                "secretsmanager:UpdateSecret"
            ],
            "Resource": "*"
        },
        {
            "Sid": "ECRPushPull",
            "Effect": "Allow",
            "Action": [
                "ecr:GetAuthorizationToken",
                "ecr:BatchCheckLayerAvailability",
                "ecr:PutImage",
                "ecr:InitiateLayerUpload",
                "ecr:UploadLayerPart",
                "ecr:CompleteLayerUpload",
                "ecr:DescribeRepositories",
                "ecr:CreateRepository",
                "ecr:BatchGetImage",
                "ecr:ListImages"
            ],
            "Resource": "*"
        },
        {
            "Sid": "IAMRoleForEC2",
            "Effect": "Allow",
            "Action": [
                "iam:CreateRole",
                "iam:DeleteRole",
                "iam:GetRole",
                "iam:ListRoles",
                "iam:ListRolePolicies",
                "iam:AttachRolePolicy",
                "iam:DetachRolePolicy",
                "iam:PutRolePolicy",
                "iam:DeleteRolePolicy",
                "iam:ListAttachedRolePolicies",
                "iam:CreateInstanceProfile",
                "iam:DeleteInstanceProfile",
                "iam:GetInstanceProfile",
                "iam:ListInstanceProfiles",
                "iam:ListInstanceProfilesForRole",
                "iam:AddRoleToInstanceProfile",
                "iam:RemoveRoleFromInstanceProfile",
                "iam:GetPolicy",
                "iam:GetPolicyVersion",
                "iam:ListEntitiesForPolicy"
            ],
            "Resource": "*"
        },
        {
            "Sid": "EC2IamProfileAttach",
            "Effect": "Allow",
            "Action": [
                "ec2:AssociateIamInstanceProfile",
                "ec2:DisassociateIamInstanceProfile",
                "ec2:ReplaceIamInstanceProfileAssociation",
                "ec2:DescribeIamInstanceProfileAssociations"
            ],
            "Resource": "*"
        }
    ]
}
EOF

echo "Generated: $OUTPUT_FILE"
