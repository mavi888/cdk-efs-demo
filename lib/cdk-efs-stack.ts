import * as cdk from "@aws-cdk/core";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as lambda from "@aws-cdk/aws-lambda";
import * as efs from "@aws-cdk/aws-efs";
import * as apigw from "@aws-cdk/aws-apigatewayv2";

export class CdkEfsStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, "Vpc", {
      maxAzs: 2,
    });

    const fs = new efs.FileSystem(this, "FileSystem", {
      vpc,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const accessPoint = fs.addAccessPoint("AccessPoint", {
      createAcl: {
        ownerGid: "1001",
        ownerUid: "1001",
        permissions: "750",
      },
      path: "/message",
      posixUser: {
        gid: "1001",
        uid: "1001",
      },
    });

    const efsLambda = new lambda.Function(this, "efsLambdaFunction", {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.asset("lambdas"),
      handler: "message_wall.handler",
      vpc: vpc,
      filesystem: lambda.FileSystem.fromEfsAccessPoint(accessPoint, "/mnt/msg"),
    });

    let api = new apigw.HttpApi(this, "Endpoint", {
      defaultIntegration: new apigw.LambdaProxyIntegration({
        handler: efsLambda,
      }),
    });

    new cdk.CfnOutput(this, "HTTP API Url", {
      value: api.url ?? "Something went wrong with the deploy",
    });
  }
}
