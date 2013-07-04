Little command-line utility to put to Azure Blob Storage.

It will be deprectated after this functionality gets implemented in the [azure-cli](https://github.com/WindowsAzure/azure-sdk-tools-xplat).

![ss-2013-07-04T11-56-59.png](http://blog.auth0.com.s3.amazonaws.com/ss-2013-07-04T11-56-59.png)

## Installation

	npm install -g put-blob

## Usage

	put-blob -a <account name> -k "<account key>" -c <container> <file>

Copy a blob on the same container as follows

	put-blob -a <account name> -k "<account key>" -c <container> -f <source blob name> <target blob name>

By default it uploads chunks of 4Mb, use `-z 2` to change to an arbitrary size.

## License

MIT - 2013 - Jose F. Romaniello