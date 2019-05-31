// must fix after sleep

import axios from 'axios'

import db from '@app/database'

const GITHUB_REPO = 'https://api.github.com/repos/'
const GITHUB_ORG_HOOK = 'https://api.github.com/orgs/' + process.env.GITHUB_ORG + '/hooks'

// TODO repo string validator

const headers = { 'Authorization': 'Bearer ' + process.env.GITHUB_ACCESS_TOKEN }

async function getRepository(repository: string): Promise<any> {
    const response = await axios.get(GITHUB_REPO + repository, { headers })
    if (response.status !== 200) {
        throw Error('get_repo_failed')
    }

    return response.data
}

async function hookExists(): Promise<boolean> {
    if (!db.getHookId()) {
        return false
    }

    const response = await axios.get(GITHUB_ORG_HOOK + '/' + String(db.getHookId()))
    if (response.status !== 200) {
        db.setHookId(0)
        return false
    }

    return true
}

async function createHook(): Promise<void> {
    if(await hookExists()) {
        return
    }

    // TODO jsonify events
    const payload = {
        'name': 'web',
        'active': true,
        'events': [
            'deployment',
            'issues',
            'issue_comment',
            'pull_request',
            'release',
            'repository'
        ],
        'config': {
            'url': process.env.SITE_URL + '/hook',
            'content_type': 'json'
        }
    }

    try {
        const response = await axios.post(GITHUB_ORG_HOOK, payload, { headers })

        if (response.status !== 201) {
            throw Error('create_hook_failed')
        }
    
        db.setHookId(response.data.id)
    } catch(err) {
        // will fix later
        //console.log(err)
    }
}

export default {
    createHook,
    getRepository
}