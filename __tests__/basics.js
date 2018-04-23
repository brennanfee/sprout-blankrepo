'use strict'
const Sprout = require('sprout')
const shell = require('shelljs')
const path = require('path')
const fs = require('fs')

const template_path = path.resolve(__dirname, '..')
const template_name = 'test-sprout-template'
const test_path = path.join(__dirname, 'tmp')

const sprout = new Sprout(path.join(__dirname, 'config'))

describe('NPM package scenario with license works', () => {
    beforeAll(() => {
        jest.setTimeout(30000)

        let options = {
            locals: {
                projectName: 'test-name',
                projectDescription: 'Test description',
                isNpmPkg: true,
                authorName: 'TestAuthor',
                authorEmail: 'test@author.com',
                githubAccount: 'SomeGithubAccount',
                license: 'MIT',
            },
        }

        shell.rm('-rf', test_path)

        return sprout.add(template_name, template_path).then(sprout => {
            return sprout.init(template_name, test_path, options)
        })
    })

    afterAll(() => {
        shell.rm('-rf', test_path)
        return sprout.remove(template_name)
    })

    test('created the files', () => {
        const expected = [
            '.editorconfig',
            '.gitattributes',
            '.gitignore',
            '.prettierignore',
            'license',
            'package.json',
            'package-lock.json',
            'readme.md',
        ]

        expected.forEach(file => {
            var fileExists = fs.existsSync(path.join(test_path, file))
            expect(fileExists).toBe(true)
        })
    })
})
