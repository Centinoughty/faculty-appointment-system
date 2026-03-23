from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


password=input("Enter password: ")
newp=pwd_context.hash(password)

print("Hashed password: ",newp)

