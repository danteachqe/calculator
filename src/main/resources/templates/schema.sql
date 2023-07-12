CREATE TABLE Customers (
    CustomerID INT AUTO_INCREMENT,
    FirstName VARCHAR(50),
    LastName VARCHAR(50),
    Email VARCHAR(100),
    PasswordHash VARCHAR(255),
    PRIMARY KEY (CustomerID)
);

CREATE TABLE Products (
    ProductID INT AUTO_INCREMENT,
    Name VARCHAR(100),
    Description TEXT,
    Price DECIMAL(10, 2),
    Quantity INT,
    PRIMARY KEY (ProductID)
);

CREATE TABLE Orders (
    OrderID INT AUTO_INCREMENT,
    CustomerID INT,
    OrderDate DATETIME,
    TotalAmount DECIMAL(10, 2),
    PRIMARY KEY (OrderID),
    FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID)
);

CREATE TABLE OrderItems (
    OrderItemID INT AUTO_INCREMENT,
    OrderID INT,
    ProductID INT,
    Quantity INT,
    Price DECIMAL(10, 2),
    PRIMARY KEY (OrderItemID),
    FOREIGN KEY (OrderID) REFERENCES Orders(OrderID),
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID)
);
