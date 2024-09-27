from dotenv import load_dotenv
import base64
import os
import hashlib

from azure.identity.aio import ClientSecretCredential
from azure.storage.blob.aio import BlobServiceClient

load_dotenv()

class AzureBlobHandler:
    def __init__(self, default_img_path):
        client_id = os.environ['AZURE_CLIENT_ID']
        tenant_id = os.environ['AZURE_TENANT_ID']
        client_secret = os.environ['AZURE_CLIENT_SECRET']
        self.account_url = os.environ["AZURE_STORAGE_URL"]
        
        self.credentials = ClientSecretCredential(
            client_id=client_id, 
            client_secret=client_secret,
            tenant_id=tenant_id
        )

        self.blob_service_client = BlobServiceClient(account_url=self.account_url, credential=self.credentials)
        self.container_name = 'crashoutpicstorage'
        self.container_client = self.blob_service_client.get_container_client(container=self.container_name)

        with open(default_img_path, "rb") as image_file:
            encoded_string = base64.b64encode(image_file.read())
            self.default_image = "data:image/jpeg;base64," + encoded_string.decode('utf-8')
            self.default_image_hash = hashlib.sha256(self.default_image.encode('utf-8')).hexdigest()

    async def upload_blob(self, base64_str: str | None) -> str:
        if base64_str is None:
            return self.default_image_hash
        image_hash = hashlib.sha256(base64_str.encode('utf-8')).hexdigest()
        try:
            await self.container_client.upload_blob(name=f"{image_hash}.txt", data=base64_str, overwrite=True) 
        except Exception as e:
            print(f"Error while uploading image: {e}")
            return self.default_image_hash
        return image_hash

    async def get_blob(self, image_hash: str | None) -> str:
        if image_hash is None or image_hash == self.default_image_hash:
            return self.default_image
        blob_name = f"{image_hash}.txt"
        blob_client = self.container_client.get_blob_client(blob=blob_name)
        try:
            download = await blob_client.download_blob()
            data = await download.readall()
            return data.decode()
        except Exception as e:
            print("Error downloading blob, returning default blob")
        return self.default_image
