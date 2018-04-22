const str = require('underscore.string')
const path = require('path')
const githubUserName = require('github-username')

const licenses = [
    { name: 'Apache License 2.0', value: 'Apache-2.0' },
    { name: 'MIT License', value: 'MIT' },
    { name: 'Universal Permissive License v1.0', value: 'UPL-1.0' },
    { name: 'Mozilla Public License 2.0', value: 'MPL-2.0' },
    { name: 'BSD 2-Clause "Simplified" License', value: 'BSD-2-Clause' },
    { name: 'BSD 3-Clause "New" or "Revised" License', value: 'BSD-3-Clause' },
    { name: 'Internet Systems Consortium (ISC) License', value: 'ISC' },
    { name: 'GNU Affero General Public License v3.0 or later', value: 'AGPL-3.0-or-later' },
    { name: 'GNU General Public License v3.0 or later', value: 'GPL-3.0-or-later' },
    { name: 'GNU Lesser General Public License v3.0 or later', value: 'LGPL-3.0-or-later' },
    { name: 'The Unlicense', value: 'Unlicense' },
    { name: 'SIL Open Font License 1.1', value: 'OFL-1.1' },
    { name: 'No License (Copyrighted)', value: 'UNLICENSED' },
]

const globalConfig = {}

exports.before = function(utils) {
    globalConfig.targetPath = utils.target.path

    return utils.target.exec('git config user.name').then(gitUserName => {
        globalConfig.gitName = gitUserName[0].trim()
        return utils.target.exec('git config user.email').then(gitUserEmail => {
            globalConfig.gitEmail = gitUserEmail[0].trim()
            return githubUserName(globalConfig.gitEmail).then(githubUserName => {
                globalConfig.githubUserName = githubUserName
            }, () => '')
        }, () => '')
    }, () => '')
}

exports.configure = [
    {
        name: 'projectName',
        message: 'Your project name (repo name of folder name):',
        default: () => {
            if (globalConfig.targetPath) {
                return str.slugify(path.basename(globalConfig.targetPath))
            } else {
                return ''
            }
        },
        filter: str.slugify,
        validate(str) {
            return str.length > 0
        },
    },
    {
        name: 'projectDescription',
        message: 'Project description:',
    },
    {
        name: 'authorName',
        message: "Author's name:",
        default: () => {
            return globalConfig.gitName || ''
        },
    },
    {
        name: 'authorEmail',
        message: "Author's email:",
        default: () => {
            return globalConfig.gitEmail || ''
        },
    },
    {
        name: 'githubAccount',
        message: 'GitHub username or organization:',
        default: () => {
            return globalConfig.githubUserName || ''
        },
    },
    {
        type: 'list',
        name: 'license',
        message: 'Which license do you want to use?',
        default: 'Apache-2.0',
        choices: licenses,
    },
]

exports.beforeRender = function(utils, config) {
    if (config.projectDescription && !config.projectDescription.endsWith('.')) {
        config.projectDescription += '.'
    } else {
        config.projectDescription = `${config.projectName}.`
    }

    config.authorUrl = ''
    config.repository = ''
    config.repositoryUrl = ''
    if (config.githubAccount) {
        config.authorUrl = `https://github.com/${config.githubAccount}`
        config.repository = `github:${config.githubAccount}/${config.projectName}`
        config.repositoryUrl = `${config.authorUrl}/${config.projectName}`
    }

    config.author = ''
    config.authorMarkdownLink = ''
    if (config.authorName) {
        config.author = config.authorName
        config.authorMarkdownLink = config.authorName

        if (config.authorEmail) {
            config.author += ` <${config.authorEmail}>`
        }
        if (config.authorUrl) {
            config.author += ` (${config.authorUrl})`
            config.authorMarkdownLink = `[${config.authorName}](${config.authorUrl})`
        }
    }

    config.copyrightYear = new Date().getFullYear()
    config.year = config.copyrightYear
}

exports.after = function(utils, config) {
    _writePackageJson(utils, config)
    return _writeLicenseFile(utils, config).then(_executeCommands(utils, config))
}

function _writePackageJson(utils, config) {
    let pkg = {
        name: config.projectName,
        version: '0.0.1',
        description: config.projectDescription,
        repository: '',
        homepage: '',
        bugs: '',
        author: '',
        keywords: [],
        devDependencies: {},
        dependencies: {},
        license: config.license,
        scripts: {
            test: 'echo "Error: no tests specified" && exit 1',
        },
    }

    if (config.author) {
        pkg.author = config.author
    }

    if (config.repository) {
        pkg.repository = config.repository
    }

    if (config.repositoryUrl) {
        pkg.homepage = `${config.repositoryUrl}#readme`
        pkg.bugs = `${config.repositoryUrl}/issues`
    }

    if (config.license === 'UNLICENSED') {
        pkg.private = true
    }

    utils.target.write('package.json', JSON.stringify(pkg))
}

function _writeLicenseFile(utils, config) {
    return utils.src.read(`licenses/${config.license}.txt`).then(content => {
        utils.target.write('LICENSE', content, config)
    })
}

function _executeCommands(utils, config) {
    // First run npm install
    return utils.target
        .exec('npm install')
        .then(() => {
            // Now setup git
            return utils.target.exec('git init --quiet')
        })
        .then(() => {
            // Attach the remote repo if we can
            if (config.repositoryUrl) {
                return utils.target.exec(`git remote add origin ${config.repositoryUrl}`)
            } else {
                return Promise.resolve()
            }
        })
        .then(() => {
            // Stage the initial files
            return utils.target.exec('git add .')
        })
        .then(() => {
            // Perform the initial commit
            return utils.target.exec('git commit -m "Initial commit"')
        })
}
