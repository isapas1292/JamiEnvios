CREATE TABLE [Empleados] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY,
    [Usuario_Id] INT,
    [DocumentodeIdentidad] VARCHAR(50) NOT NULL,
    [Nombre] VARCHAR(100) NOT NULL,
    [Email] VARCHAR(100) NOT NULL,
    [Telefono] VARCHAR(50),
    [Cargo] VARCHAR(50),
    [FechaIngreso] DATE,
    [Activo] BIT
);
GO

CREATE TABLE [Envios] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY,
    [Numero_Guia] VARCHAR(50) NOT NULL,
    [Nombre_Cliente] VARCHAR(255) NOT NULL,
    [Fecha_Recepcion] DATE NOT NULL,
    [Estado_Actual] VARCHAR(100) NOT NULL,
    [Destino] VARCHAR(255) NOT NULL,
    [Observaciones] VARCHAR(MAX),
    [Usuario_Id] INT,
    [Estado_Envio_Id] INT NOT NULL,
    [Nombre_Recibe] VARCHAR(255),
    [Cedula_Recibe] VARCHAR(20),
    [DocumentodeIdentidad] VARCHAR(20),
    [Telefono_Cliente] VARCHAR(20),
    [Telefono_Recibe] VARCHAR(20)
);
GO

CREATE TABLE [EstadosEnvio] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY,
    [Nombre] VARCHAR(100) NOT NULL,
    [Activo] BIT NOT NULL
);
GO

CREATE TABLE [FacturaDetalles] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY,
    [Factura_Id] INT,
    [Articulo] VARCHAR(100),
    [Cantidad] INT,
    [Unidad_Venta] VARCHAR(50),
    [Precio] DECIMAL(18, 2),
    [Descuento_Porcentaje] DECIMAL(18, 2),
    [Importe_IVA] DECIMAL(18, 2),
    [Cantidad_Total] DECIMAL(18, 2)
);
GO

CREATE TABLE [Facturas] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY,
    [Nombre_Cliente] VARCHAR(100),
    [DocumentodeIdentidad] VARCHAR(50),
    [Breve_Descripcion] VARCHAR(255),
    [Fecha] DATE,
    [Vencimiento] DATE,
    [Fecha_Pago] DATE,
    [Estatus] VARCHAR(50),
    [Cerrado] BIT,
    [Cobrar_IVA] BIT,
    [Firma_Cliente] VARCHAR(MAX),
    [Cantidad] DECIMAL(18, 2),
    [Importe_IVA] DECIMAL(18, 2),
    [Cantidad_Total] DECIMAL(18, 2),
    [Cantidad_Pagar] DECIMAL(18, 2),
    [Pagos] DECIMAL(18, 2),
    [Importe_Pendiente] DECIMAL(18, 2),
    [Numero_Factura] VARCHAR(50),
    [Usuario_Id] INT
);
GO

CREATE TABLE [Roles] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY,
    [Nombre] VARCHAR(255) NOT NULL
);
GO

CREATE TABLE [Usuarios] (
    [Id] INT IDENTITY(1,1) PRIMARY KEY,
    [Nombre] VARCHAR(255) NOT NULL,
    [Email] VARCHAR(255) NOT NULL,
    [Password] VARCHAR(255) NOT NULL,
    [Rol_Id] INT,
    [Phone] VARCHAR(20) NOT NULL,
    [DocumentodeIdentidad] VARCHAR(20)
);
GO

