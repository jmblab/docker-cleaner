const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
    const { execSync } = require('child_process');
    try {
        const branchName = core.getInput('branch');
        const repoNameWithOwner = core.getInput('repo');  
        const repoOwner = core.getInput('owner');  
        const azureClientId = core.getInput('azureClientId');  
        const azureClientSecret = core.getInput('azureClientSecret');  
        const azureTenantId = core.getInput('azureTenantId');  
        const azureSubscriptionId = core.getInput('azureSubscriptionId');  
        const registryName = core.getInput('azureRegistryName');

        if (branchName.includes('main') || branchName.includes('release')) {
            console.log('Branch name contains "main" or "release". Skipping operation.');
            return;
        }

        const modifiedBranchname = branchName.replace(/\//g, "_");
    
        execSync(`az login --service-principal -u ${azureClientId} -p ${azureClientSecret} --tenant ${azureTenantId}`, { stdio: 'inherit' });

        execSync(`az account set --subscription ${azureSubscriptionId}`, { stdio: 'inherit' });

        const reposListCommand = `az acr repository list --name ${registryName} --output tsv`;
        const repositories = execSync(reposListCommand).toString().trim().split('\n');

        repositories.forEach(repository => {
            console.log(`Processing repository: ${repository}`);
      
            const tagsListCommand = `az acr repository show-tags --name ${registryName} --repository ${repository} --output tsv`;
            const tags = execSync(tagsListCommand).toString().trim().split('\n');

            const branchTags = tags.filter(tag => tag.includes(modifiedBranchname));
            console.log(`Branch-specific tags in repository ${repository}:`, branchTags);

            branchTags.forEach(tag => {
                console.log('Deleting manifest and tag');

                const deleteCommand = `az acr repository delete -n ${registryName} --image ${repository}:${tag} -y`;
                execSync(deleteCommand);

                console.log('Manifest and tag deleted');
            })
        });

        console.log('Operation completed');
    } catch (error) {
        core.setFailed(error.toString());
    }    
}

run();
