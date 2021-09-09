import * as core from '@actions/core'
import {join} from 'path'
import {readFile} from 'fs'
import yaml from 'js-yaml'

type safeLoadType = string | object | undefined

interface Pubspec {
  version?: string
}

const inputs = {
  path: core.getInput('path-to-pubspec') ?? ''
}

async function getFlutterVersion(): Promise<void> {
  const dir = `${process.env.GITHUB_WORKSPACE || '.'}${inputs.path}/`
  const pubspecYaml = join(dir, 'pubspec.yaml')
  const pubspecObj = await readYamlFile(pubspecYaml)

  if (!pubspecObj) {
    throw new Error(`pubspec.yaml not found ${pubspecYaml}`)
  }
  if (typeof pubspecObj !== 'object') {
    throw new Error(`${pubspecObj} is not an object`)
  }

  const pubspecData = pubspecObj as Pubspec
  if (!pubspecData.version) {
    throw new Error('version not found in pubspec.yaml')
  }
  const versionList = pubspecData.version.split('+')

  core.info(`Found version: ${pubspecData.version}`)

  core.info(`version_number: ${versionList[0]}`)
  core.info(`build_number: ${versionList[1]}`)
  core.setOutput('version_number', versionList[0])
  core.setOutput('build_number', versionList[1])
}

async function readYamlFile(file: string): Promise<safeLoadType> {
  const fileData: string = await new Promise((resolve, reject) =>
    readFile(file, 'utf8', (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  )
  return yaml.safeLoad(fileData)
}

async function run(): Promise<void> {
  try {
    await getFlutterVersion()
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
