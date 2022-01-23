## Archive Notice
AWS has now added this functionality into their [GitHub action](https://github.com/aws-actions/configure-aws-credentials). It is recommended you use that for the latest features. 


# Github Actions Assume Role
This github action is to allow for assuming role via the steps provided in [AWS federation comes to GitHub Actions](https://awsteele.com/blog/2021/09/15/aws-federation-comes-to-github-actions.html). The idea is to abstract away some of the process from the user, such that they only need to have the role id available.

## Configuring the role
First you will need to configure the role to be assumed. Here is an example cloudformation template taken from the blog post.

```yaml
Parameters:
  RepoName:
    Type: String
    Default: aidansteele/aws-federation-github-actions
  GithubOrg:
    Type: String
    Default: aidansteele

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
                token.actions.githubusercontent.com:sub: !Sub repo:${RepoName}:*

  GithubOidc:
    Type: AWS::IAM::OIDCProvider
    Properties:
      Url: https://token.actions.githubusercontent.com
      ClientIdList: 
        - !Sub https://github.com/${GithubOrg}
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
...
    permissions:
      id-token: write
      contents: read
    steps:
      - uses: danquack/aws-assume-role@main
        with:
          role_arn: arn:aws:iam::123456789012:role/ExampleGithubRole
      - run: aws sts get-caller-identity
```
