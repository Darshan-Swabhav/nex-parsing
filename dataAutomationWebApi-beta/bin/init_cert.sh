#! /bin/bash
MKCERT_BIN=$(which mkcert)
if [[ ! -z $MKCERT_BIN ]]
then
    echo """
    ==========================================================
      Creating certificate for da.test
    ==========================================================
    """
    mkcert da.test

    echo """
    ==========================================================
      Copying da.test certificates to ./nginx/certs
    ==========================================================
    """

    mv ./da.test.pem ./nginx/certs/da.test.crt
    chmod a+x ./nginx/certs/da.test.crt
    mv ./da.test-key.pem ./nginx/certs/da.test.key
    chmod a+x ./nginx/certs/da.test.key

    echo """
    ==========================================================
      Add the following to /etc/hosts file:
      127.0.0.1 da.test
    ==========================================================
    """

else
    echo """
    ==========================================================
      Please install mkcert 
      https://github.com/FiloSottile/mkcert#installation
    ==========================================================
    """
    exit 1
fi
#! /bin/bash
MKCERT_BIN=$(which mkcert)
if [[ ! -z $MKCERT_BIN ]]
then
    echo """
    ==========================================================
      Creating certificate for da.test
    ==========================================================
    """
    mkcert da.test

    echo """
    ==========================================================
      Copying da.test certificates to ./nginx/certs
    ==========================================================
    """

    mv ./da.test.pem ./nginx/certs/da.test.crt
    chmod a+x ./nginx/certs/da.test.crt
    mv ./da.test-key.pem ./nginx/certs/da.test.key
    chmod a+x ./nginx/certs/da.test.key

    echo """
    ==========================================================
      Add the following to /etc/hosts file:
      127.0.0.1 da.test
    ==========================================================
    """

else
    echo """
    ==========================================================
      Please install mkcert 
      https://github.com/FiloSottile/mkcert#installation
    ==========================================================
    """
    exit 1
fi
