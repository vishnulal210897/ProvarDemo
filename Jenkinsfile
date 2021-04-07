pipeline {
    agent any
    options { skipDefaultCheckout() }
    stages {
        stage("checkout SCM") {
            steps {
            cleanWs()
            echo 'checkout scm'
            checkout scm
            
            
        }
    }
    stage ("Provar test") {
        steps{
            dir('ANT')
            bat 'ant -f build.xml'
        }
    }
  }
}
