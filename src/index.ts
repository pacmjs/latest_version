import axios, { AxiosResponse } from 'axios';
import semver from 'semver';

interface NpmRegistryResponse {
    'dist-tags': {
        latest: string;
    };
    versions: {
        [version: string]: any;
    };
}

const getLatestVersion = async (packageName: string): Promise<string> => {
    try {
        const { data } = await axios.get<NpmRegistryResponse>(`https://registry.npmjs.org/${packageName}`);
        return data['dist-tags'].latest;
    } catch (error: any) {
        throw new Error(`Failed to fetch latest version for ${packageName}: ${error.message}`);
    }
};

const validateVersion = async (packageName: string, version: string): Promise<string> => {
    if (!semver.valid(version) && version !== "latest") {
        throw new Error(`Invalid version format: ${version}`);
    }

    if (version === "latest") {
        version = await getLatestVersion(packageName);
    }

    try {
        await axios.get(`https://registry.npmjs.org/${packageName}/${version}`);
        return version;
    } catch (error: any) {
        if (error.response && error.response.status === 404) {
            console.log(`Version ${version === "latest" ? "ZZZZZZZ EASTER EGG ZZZZZZZ" : version} does not exist for package ${packageName}. Using latest version instead.`);
            return await getLatestVersion(packageName);
        } else {
            throw new Error(`Failed to validate version ${version} for package ${packageName}: ${error.message}`);
        }
    }
};

const getLatestCompatibleVersion = async (packageName: string, versionRange: string): Promise<string> => {
    try {
        const { data } = await axios.get<NpmRegistryResponse>(`https://registry.npmjs.org/${packageName}`);
        const versions = Object.keys(data.versions);
        const latestCompatibleVersion = semver.maxSatisfying(versions, versionRange);
        if (!latestCompatibleVersion) {
            throw new Error(`No compatible version found for ${packageName} with range ${versionRange}`);
        }
        return latestCompatibleVersion;
    } catch (error: any) {
        throw new Error(`Failed to fetch latest compatible version for ${packageName}: ${error.message}`);
    }
};

const getLatestVersionForRange = async (packageName: string, range: string) => {
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

export {
    getLatestVersion,
    validateVersion,
    getLatestCompatibleVersion,
    getLatestVersionForRange
};