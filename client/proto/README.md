# Buoy George Message Definition

## Buf.Build Service

We use [buf.build](https://buf.build) to enforce correct linting and check for breaking changes in our protobuf definitions. This helps maintain a high-quality API surface and prevents accidental compatibility issues. They also build automatic code generation for various languages.

Our Buf.Build repository is `buf.build/berrg/george`.
See the [Buf.Build documentation](https://buf.build/docs/).

## Definition

Our protobuf definitions are located in the `proto` directory.  
The main message is `v1/from_buoy.proto`.

We use Protobuf version 3 syntax. All fields are optional by design. When a field is additionally marked as `optional`, you can check whether it is set or not. If you read a field that is not set, you will receive its default value.

See the [Protobuf documentation](https://protobuf.dev/programming-guides/proto3/) for more details.

A typical message contains either `sensor_record`, `manifest`, or `self_test`. All of these can include a repeated field for logs and system performance data.

## Get Precompiled Code

Log in to `buf.build` and this repository. Go to `SDKs` and choose your language and preferred style.

For example, for C and nanopb v0.4.9 syntax:

```bash
curl -n -fsSL -O https://buf.build/gen/archive/berrg/george/community/nanopb/v0.4.9-7a49d309a599.1.zip
```

This zip file contains the precompiled code for the specified language and style, using version 0.4.9 of the nanopb generator.

It is also possible to set up artifact repositories and CI/CD pipelines.

## Nortek MED

Nortek MED uses a custom message format based on C structs. This format will be supported in parallel with the Protobuf syntax.
