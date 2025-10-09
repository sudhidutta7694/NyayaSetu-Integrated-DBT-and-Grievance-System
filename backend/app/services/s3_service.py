import os
import boto3
from botocore.exceptions import ClientError
from typing import Optional
import uuid
from datetime import datetime

class S3Service:
    def __init__(self):
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
            region_name=os.getenv('AWS_REGION', 'eu-north-1')
        )
        self.bucket_name = os.getenv('S3_BUCKET_NAME')
    
    def generate_presigned_upload_url(
        self,
        filename: str,
        content_type: str,
        aadhaar_number: str,
        document_type: str,
        expires_in: int = 300
    ) -> dict:
       
        try:
            # Get file extension
            file_extension = filename.split('.')[-1] if '.' in filename else ''
            
            # Get clean filename without extension
            clean_filename = '.'.join(filename.split('.')[:-1]) if '.' in filename else filename
            
            # Create simplified filename: aadhaar_originalname.ext
            new_filename = f"{aadhaar_number}_{clean_filename}.{file_extension}"
            
            # Create organized path: aadhaar_number/documents/aadhaar_filename.ext
            s3_key = f"{aadhaar_number}/documents/{new_filename}"
            
            # Generate presigned URL for PUT operation
            url = self.s3_client.generate_presigned_url(
                'put_object',
                Params={
                    'Bucket': self.bucket_name,
                    'Key': s3_key,
                    'ContentType': content_type
                },
                ExpiresIn=expires_in
            )
            
            return {
                "url": url,
                "s3_key": s3_key,
                "filename": filename
            }
            
        except ClientError as e:
            print(f"Error generating presigned URL: {e}")
            raise Exception(f"Failed to generate upload URL: {str(e)}")
    
    def generate_presigned_download_url(self, s3_key: str, expiration: int = 3600) -> str:
        """
        Generate a presigned URL for downloading a file from S3
        
        Args:
            s3_key: The S3 object key
            expiration: URL expiration time in seconds (default 1 hour)
        
        Returns:
            Presigned URL string
        """
        try:
            url = self.s3_client.generate_presigned_url(
                'get_object',
                Params={
                    'Bucket': self.bucket_name,
                    'Key': s3_key
                },
                ExpiresIn=expiration
            )
            return url
        except ClientError as e:
            print(f"Error generating presigned URL: {e}")
            raise Exception(f"Failed to generate download URL: {str(e)}")
    
    def delete_document(self, s3_key: str) -> bool:
        try:
            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=s3_key
            )
            return True
        except ClientError as e:
            print(f"Error deleting from S3: {e}")
            raise Exception(f"Failed to delete document: {str(e)}")
    
    def check_file_exists(self, s3_key: str) -> bool:
        try:
            self.s3_client.head_object(Bucket=self.bucket_name, Key=s3_key)
            return True
        except ClientError:
            return False
