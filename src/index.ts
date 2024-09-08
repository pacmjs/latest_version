import axios, { AxiosResponse } from "axios";
import semver from "semver";

export const getLatestVersion = async (packageName: string) => {
    const res = (await axios.get(`https://registry.npmjs.org/${packageName}/latest`).catch(() => undefined)) as
        | AxiosResponse<any, any>
        | undefined;

    const errors: string[] = [];

    if (!res || res.status !== 200) {
        errors.push(`\nPackage ${packageName} not found`);
        return { latestVersion: null, errors };
    }

    const data = res.data;
    return { latestVersion: data.version, errors };
};

export const getLatestVersionForRange = async (packageName: string, range: string) => {
    const res = (await axios.get(`https://registry.npmjs.org/${packageName}`).catch(() => undefined)) as
        | AxiosResponse<any, any>
        | undefined;

    let errors: string[] = [];

    if (!res || res.status !== 200) {
        errors.push(`\nPackage ${packageName} not found`);
        return { latestVersion: null, errors };
    }

    const data = res.data;

    const versions = Object.keys(data.versions);
    const validVersions = versions.filter((version) => semver.satisfies(version, range));
    const latestVersion = validVersions
        .sort((a, b) => semver.rcompare(a, b))[0]
        .replace(/\^|~/, "")
        .replace("=", "");

    return { latestVersion, errors };
};
