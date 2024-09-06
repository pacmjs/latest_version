import axios from "axios";
import semver from "semver";

export const getLatestVersion = async (packageName: string) => {
    const { data } = await axios.get(
        `https://registry.npmjs.org/${packageName}/latest`,
    );
    return data.version;
};

export const getLatestVersionForRange = async (
    packageName: string,
    range: string,
) => {
    const { data } = await axios.get(
        `https://registry.npmjs.org/${packageName}`,
    );
    const versions = Object.keys(data.versions);
    const validVersions = versions.filter((version) =>
        semver.satisfies(version, range),
    );
    const latestVersion = validVersions.sort((a, b) =>
        semver.rcompare(a, b),
    )[0];
    return latestVersion;
};
