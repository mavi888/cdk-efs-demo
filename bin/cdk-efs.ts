#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { CdkEfsStack } from '../lib/cdk-efs-stack';

const app = new cdk.App();
new CdkEfsStack(app, 'CdkEfsStack');
