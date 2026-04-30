pipeline {
    agent any

    environment {
        IMAGE_NAME = "aupp-lms-api"
        CONTAINER_NAME = "aupp-lms-container"
        EC2_USER = "ubuntu"
        SSH_KEY = "C:\\jenkins-keys\\aupp-lms-key"
    }

    stages {
        stage('Clone from GitHub') {
            steps {
                git branch: 'main', url: 'https://github.com/yohiji-1/devops-final-project.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'npm install'
            }
        }

        stage('SonarQube Analysis') {
    steps {
        script {
            def scannerHome = tool 'SonarScanner'
            withSonarQubeEnv('SonarQube-Server') {
                bat "${scannerHome}\\bin\\sonar-scanner.bat"
            }
        }
    }
}

        stage('Quality Gate') {
            steps {
                timeout(time: 2, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Trivy File Scan / Dependency Scan') {
            steps {
                bat 'trivy fs --exit-code 1 --severity CRITICAL .'
            }
        }

        stage('Build Docker Image') {
            steps {
                bat 'docker build -t %IMAGE_NAME% .'
            }
        }

        stage('Trivy Docker Image Scan') {
            steps {
                bat 'trivy image --exit-code 1 --severity CRITICAL %IMAGE_NAME%'
            }
        }

        stage('Terraform Apply') {
            steps {
                dir('terraform') {
                    bat 'terraform init'
                    bat 'terraform apply -auto-approve'
                    bat 'terraform output -raw public_ip > public_ip.txt'
                }
            }
        }

        stage('EC2 Instance Created') {
            steps {
                script {
                    def ip = readFile('terraform/public_ip.txt').trim()
                    echo "EC2 Instance Created Successfully"
                    echo "EC2 Public IP: ${ip}"
                }
            }
        }
                stage('Deploy to EC2') {
            steps {
                script {
                    def ip = readFile('terraform/public_ip.txt').trim()

                    bat 'docker save %IMAGE_NAME% -o aupp-lms-api.tar'

                    bat "scp -i C:\\jenkins-keys\\aupp-lms-key -o StrictHostKeyChecking=no aupp-lms-api.tar ubuntu@${ip}:/home/ubuntu/"

                    bat """
                    ssh -i C:\\jenkins-keys\\aupp-lms-key -o StrictHostKeyChecking=no ubuntu@${ip} "sudo docker load -i /home/ubuntu/aupp-lms-api.tar && sudo docker stop aupp-lms-container || true && sudo docker rm aupp-lms-container || true && sudo docker run -d -p 3000:3000 --name aupp-lms-container aupp-lms-api"
                    """
                }
            }
        }
    }
}
