# Github Actions Assume Role
This github action is to allow for assuming role via the steps provided in [AWS federation comes to GitHub Actions](https://awsteele.com/blog/2021/09/15/aws-federation-comes-to-github-actions.html). The idea is to abstract away some of the process from the user, such that they only need to have the role id available.

## Configuring the role
First you will need to configure the role to be assumed. Here is an example cloudformation template taken from the blog post.

```yaml
Parameters:
  RepoName:
    Type: String
    Default: aidansteele/aws-federation-github-actions

Resources:
  Role:
    Type: AWS::IAM::Role
    Properties:
      RoleName: ExampleGithubRole
      ManagedPolicyArns: [arn:aws:iam::aws:policy/ReadOnlyAccess]
      AssumeRolePolicyDocument:
        Statement:
          - Effect: Allow
            Action: sts:AssumeRoleWithWebIdentity
            Principal:
              Federated: !Ref GithubOidc
            Condition:
              StringLike:
                vstoken.actions.githubusercontent.com:sub: !Sub repo:${RepoName}:*

  GithubOidc:
    Type: AWS::IAM::OIDCProvider
    Properties:
      Url: https://vstoken.actions.githubusercontent.com
      ClientIdList: [sigstore]
      ThumbprintList: [a031c46782e6e6c662c2c87c76da9aa62ccabd8e]

Outputs:
  Role:
    Value: !GetAtt Role.Arn  
```

## Setup the action

#### Inputs

### `role_arn`

**Required** arn of which you want to assume.


## Example usage
```yaml
uses: danquack/aws-assume-role@main
with:
  role_arn: arn:aws:iam::123456789012:role/ExampleGithubRole
```