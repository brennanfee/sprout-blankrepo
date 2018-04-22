# sprout-bfee-blankrepo

[Sprout](https://github.com/carrot/sprout) template to create a blank Git repo.

## Files

This repo creates a minimal repo that is a _very_ basic starting repository. The following files are
created:

*   .editorconfig
*   .gitattributes
*   .gitignore
*   LICENSE - The license you selected during execution of the template.
*   package.json - An initial NPM package file. This should still be used/needed even for non-Node
    packages.
*   package-lock.json - Auto-created
*   README.md - An initial README for the project.

## GitHub use

During execution of this template it can automatically pull some information to assist with the
information needed. In order for this to work you should have an environment variable called
GITHUB_TOKEN that has a token to be used to authenticate to the GitHub API. Without that the
template will still work but you will likely need to fill in more of the prompts than would
otherwise be necessary.

## License

Apache-2.0 © 2018 [Brennan Fee](https://github.com/brennanfee)
