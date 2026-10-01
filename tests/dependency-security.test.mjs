import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import test from "node:test";

const root = process.cwd();

function assertRegistryLockfile(lockfile) {
  // Deprecation notices can link to documentation; they are not package sources.
  const sources = lockfile.replace(/^    deprecated:.*$/gm, "");
  assert.doesNotMatch(sources, /\b(?:git\+|github:|https?:|file:|link:|workspace:|tarball:)/i);
}

test("lockfile source checks allow documentation links but reject exotic resolutions", () => {
  assertRegistryLockfile("    deprecated: See https://eslint.org/version-support\n");
  for (const source of ["https://example.com/package.tgz", "git+https://example.com/repo", "github:owner/repo", "file:../package", "link:../package", "workspace:*", "tarball: package.tgz"]) {
    assert.throws(() => assertRegistryLockfile(`    resolution: {${source}}\n`));
  }
});

function compareVersions(left, right) {
  const leftParts = left.split(/[.-]/).slice(0, 3).map(Number);
  const rightParts = right.split(/[.-]/).slice(0, 3).map(Number);
  for (let index = 0; index < 3; index += 1) {
    const difference = (leftParts[index] ?? 0) - (rightParts[index] ?? 0);
    if (difference !== 0) return difference;
  }
  return 0;
}

function collectDependencyVersions() {
  const output = execFileSync(
    "pnpm",
    [
      "list",
      "brace-expansion",
      "fast-uri",
      "js-yaml",
      "picomatch",
      "--json",
      "--depth",
      "Infinity",
    ],
    { cwd: root, encoding: "utf8" },
  );
  const versions = new Map();

  function walk(node) {
    for (const dependencies of [node.dependencies, node.devDependencies]) {
      for (const [name, dependency] of Object.entries(dependencies ?? {})) {
        if (dependency.resolved) {
          assert.match(dependency.resolved, /^https:\/\/registry\.npmjs\.org\//);
        }
        if (dependency.version) {
          const current = versions.get(name) ?? new Set();
          current.add(dependency.version);
          versions.set(name, current);
        }
        walk(dependency);
      }
    }
  }

  for (const project of JSON.parse(output)) walk(project);
  return versions;
}

test("installed vulnerable dependency families are patched", () => {
  const versions = collectDependencyVersions();
  for (const name of ["brace-expansion", "fast-uri", "js-yaml", "picomatch"]) {
    assert.ok((versions.get(name)?.size ?? 0) > 0, `${name} was not inspected`);
  }

  for (const installed of versions.get("fast-uri") ?? []) {
    assert.ok(compareVersions(installed, "3.1.8") >= 0, `fast-uri@${installed} is vulnerable`);
  }
  for (const installed of versions.get("js-yaml") ?? []) {
    assert.ok(compareVersions(installed, "4.3.1") >= 0, `js-yaml@${installed} is vulnerable`);
  }
  for (const installed of versions.get("picomatch") ?? []) {
    assert.ok(compareVersions(installed, "4.0.4") >= 0, `picomatch@${installed} is vulnerable`);
  }
  for (const installed of versions.get("brace-expansion") ?? []) {
    const major = Number(installed.split(".")[0]);
    const floor = new Map([
      [1, "1.1.21"],
      [2, "2.1.7"],
      [5, "5.0.12"],
    ]).get(major);
    if (floor) {
      assert.ok(compareVersions(installed, floor) >= 0, `brace-expansion@${installed} is vulnerable`);
    }
  }
});

test("manifests and lockfile reject exotic dependency sources", () => {
  const manifest = JSON.parse(readFileSync(`${root}/package.json`, "utf8"));
  for (const dependencies of [manifest.dependencies, manifest.devDependencies]) {
    for (const specifier of Object.values(dependencies ?? {})) {
      assert.doesNotMatch(specifier, /^(?:git(?:\+|:)|https?:|file:|link:|workspace:)/i);
    }
  }

  const lockfile = readFileSync(`${root}/pnpm-lock.yaml`, "utf8");
  assertRegistryLockfile(lockfile);

  const workspace = readFileSync(`${root}/pnpm-workspace.yaml`, "utf8");
  assert.match(workspace, /^minimumReleaseAge: 10080$/m);
  assert.match(workspace, /^blockExoticSubdeps: true$/m);
});
