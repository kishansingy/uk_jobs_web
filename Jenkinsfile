pipeline {
    agent any

    parameters {
        string(name: 'BRANCH',  defaultValue: 'develop')
        string(name: 'APP_ENV', defaultValue: 'staging')
    }

    environment {
        NODE_VERSION = '22'
        DEPLOY_HOST  = credentials('DEPLOY_HOST')
        DEPLOY_USER  = credentials('DEPLOY_USER')
        DEPLOY_WEB_PATH = credentials('DEPLOY_WEB_PATH')
    }

    stages {
        stage('Checkout') {
            steps { checkout scm }
        }

        stage('Install') {
            steps {
                dir('web') {
                    sh 'npm ci'
                }
            }
        }

        stage('Lint') {
            steps {
                dir('web') {
                    sh 'npm run lint'
                }
            }
        }

        stage('Build') {
            steps {
                dir('web') {
                    sh "npm run build -- --mode ${params.APP_ENV}"
                }
            }
        }

        stage('Deploy') {
            when {
                anyOf { branch 'main'; branch 'develop' }
            }
            steps {
                withCredentials([sshUserPrivateKey(credentialsId: 'deploy-ssh-key', keyFileVariable: 'SSH_KEY')]) {
                    sh '''
                        rsync -az --delete \
                            -e "ssh -i ${SSH_KEY} -o StrictHostKeyChecking=no" \
                            web/dist/ ${DEPLOY_USER}@${DEPLOY_HOST}:${DEPLOY_WEB_PATH}/
                    '''
                }
            }
        }
    }

    post {
        failure { echo "Web pipeline failed" }
    }
}
