# Shared sign-in selection module

[sign-in-selections-terr-mod, release v0.2.0](https://github.com/bytewizard42i/terraform-modules/tree/v0.2.0/modules/sign-in-selections-terr-mod)
provides optional public sign-in choice configuration for applications in the
DIDzM (DIDzMonolith) ecosystem.

**Repository role:** Player-facing applications can reference optional entry choices; game-state proofs and player permissions require their own verification.

Use the [central adoption guide and repository index](https://github.com/bytewizard42i/DIDzMonolith/blob/main/DIDzMonolith-docs/standards/SIGN_IN_SELECTIONS_MODULE.md)
for the module call, release pin, experience modes and consumer responsibilities.
The implementation stays in the shared Terraform repository.

**Status: documentation pointer only.** No dependency, manifest loader,
authentication adapter or hosted service is installed by this pointer.
The module's external provider entries remain unverified even when configured.
Applications must explicitly map their provider identifiers and verify real
provider responses before establishing an authenticated session.
Provider selection never grants per-action permissions or disclosure consent.
