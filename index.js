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
    
    
        execSync(`az login --service-principal -u ${azureClientId} -p ${azureClientSecret} --tenant ${azureTenantId}`, { stdio: 'inherit' });

        execSync(`az account set --subscription ${azureSubscriptionId}`, { stdio: 'inherit' });

        const reposListCommand = `az acr repository list --name ${registryName} --output tsv`;
        const repositories = execSync(reposListCommand).toString().trim().split('\n');

        repositories.forEach(repository => {
            console.log(`Processing repository: ${repository}`);
      
            const tagsListCommand = `az acr repository show-tags --name ${registryName} --repository ${repository} --output tsv`;
            const tags = execSync(tagsListCommand).toString().trim().split('\n');
      
            console.log(`Tags in repository ${repository}:`, tags);

            const branchTags = tags.filter(tag => tag.includes(branchName));
            console.log(`Branch-specific tags in repository ${repository}:`, branchTags);

          //DOCELOWE USUWANIE
            // branchTags.forEach(tag => {
            //   const deleteTagCommand = `az acr repository delete --name ${registryName} --repository ${repository} --tag ${tag} --yes`;
            //   execSync(deleteTagCommand, { stdio: 'inherit' });
            //   console.log(`Deleted tag: ${tag} in repository: ${repository}`);
            // });

            
            const manifestsListCommand = `az acr repository show-manifests --name ${registryName} --repository ${repository} --output tsv`;
            const manifests = execSync(manifestsListCommand).toString().trim().split('\n');
            console.log(`Manifests in repository ${repository}:`, manifests);
     
            const branchManifests = manifests.filter(manifest => manifest.includes(branchName));
            console.log(`Branch-specific manifests in repository ${repository}:`, branchManifests);

        //DOCELOWE USUWANIE
            // branchManifests.forEach(manifest => {
            //     const deleteManifestCommand = `az acr repository delete --name ${registryName} --repository ${repository} --manifest ${manifest} --yes`;
            //     execSync(deleteManifestCommand, { stdio: 'inherit' });
            //     console.log(`Deleted manifest: ${manifest} in repository: ${repository}`);
            // });

            });

        console.log('Operation completed');
    } catch (error) {
        core.setFailed(error.toString());
    }    
}

run();
