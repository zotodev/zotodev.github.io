---
title: PostgreSQL Clients
---

This page is a partial list of interactive SQL clients (GUI or otherwise) - that doesn't include [reporting engines, ETL data loaders, or visual design tools](https://wiki.postgresql.org/wiki/Community_Guide_to_PostgreSQL_GUI_Tools), just interactive clients that you can type SQL in to and get results from them. This includes web based or desktop apps.

# Cross-platform GUI Clients

## Open Source

These clients are both "free" and "open source"

## Beekeeper Studio

<https://beekeeperstudio.io/>

Beekeeper Studio is a modern cross-platform SQL editor and database manager available for Linux, Mac, and Windows. Some of its features include:

- Clean, smooth, usable UI with dark and light themes
- Tabbed Interface
- Multiple connections at the same time
- Saved queries and run history
- Auto-complete

## pgAdmin 4

<http://www.pgadmin.org/>

pgAdmin 4 is a ground-up rewrite of pgAdmin 3. Rather than being a native application it's primarily a web application that's also packaged as desktop web shell. But runs locally.

## Postbird

Open source, desktop application to manage your local or remote PostgreSQL databases.

<https://github.com/paxa/postbird>

## Sqlectron

windows/linux/OS X

A simple and lightweight SQL client desktop/terminal with cross database and platform support. GUI or term.

<https://sqlectron.github.io/>

## SQuirrel

<http://www.squirrelsql.org/>

Platforms that support Java

SQuirreL SQL Client is a graphical Java program that will allow you to view the structure of a JDBC compliant database, browse the data in tables, issue SQL commands etc. The minimum version of Java supported is 1.8.x as of SQuirreL version 3.8.1.

Commentor 1: If it doesn't start in OS X (like nothing appears) see <https://sourceforge.net/p/squirrel-sql/bugs/1398/>

## pgAdmin 3

<http://www.pgadmin.org/>

Windows, Linux, FreeBSD, macOS, OpenBSD, Solaris

For many years the "standard" freely available GUI client for Postgresql, and so is bundled in many packaged installers. It provides a SQL query tool, an editor for procedural languages and a CRUD interface. It's also one of the few clients to provide a GUI front end to the plpgsql debugger.

Free Administration Centre for the PostgreSQL database. Includes a graphical administration interface, an SQL query tool, a procedural code editor and much more. pgAdmin III is designed to answer the needs of most users, from writing simple SQL queries to developing complex databases. The graphical interface supports all PostgreSQL features and makes administration easy. Available in more than 30 languages and for several operating systems.

pgAdmin III is an Open Source management tool for PostgreSQL databases. Features full Unicode support, fast, multithreaded query and data editing tools and support for all PostgreSQL object types.

pgAdmin III is bundled with the Windows installer on older versions of Postgres, and you can use that as a client to administer a remote server on another OS. Note that binary packages for platforms like RPM don't show up in every point release, you currently have to go back to v1.8.0 to get the last full set of packages.

Development has been discontinued by pgadmin.org, but is still being maintained by BigSQL who are doing basic maintenance to support newer versions of PostgreSQL and packaging it for current OS releases.

## Tora

<http://tora.sf.net/>

Linux, Windows, macOS

Oracle, MySQL, and PostgreSQL, as well as limited support for ODBC targets. Inspired by the proprietary Toad client.

## SQL Workbench/J

[http://www.sql-workbench.net](http://www.sql-workbench.net/)

Java

An OpenSource (though it prohibits usage by government agencies from USA, UK, Canada, China, Russia, North Korea, Syria, Saudi Arabia, Turkey and the Chechen Republic) SQL GUI tool similar to Squirrel. Data can be edited directly in the result set. It has strong support for exporting and importing data between databases using its own SQL command extension. It can be used in GUI mode or as a console application. All SQL Workbench specific commands can also be run in batch mode to automate export and import task. It supports schema comparison ("diff") and copying data between databases.

It has some [restrictions](http://sql-workbench.net/manual/license.html#license-restrictions) on use by government employees.

## DBeaver

[https://dbeaver.io](https://dbeaver.io/)

Java

Supports many SQL databases from different vendors, as well as few NoSQL ones (Cassandra, etc). Good query editor with syntax highlighting, completion and autosave. Editing of query results. SSH tunneling support. Tons of other cool features. Quite good, but not 100% perfect PostgreSQL support (yet?).

Has a free community and also "pro" version available.

## pgManage

<https://github.com/pgManage/pgManage>

An alternative to pgAdmin, which runs in both application and server modes.
Proprietary

These are "closed source" apps, some offer free demo's.

## DbVisualizer

<https://www.dbvis.com/> <https://www.dbvis.com/database/postgresql/>

Windows, MacOS, Linux, Unix

DbVisualizer is the a universal database tool that connects to all major databases and JDBC drivers including PostgreSQL. It has the [highest user satisfaction on G2.com](https://www.g2.com/categories/database-management-systems-dbms?tab=highest_rated). It provides features to write SQL to query and visualize your data, design and development features to manage your databases, tables, relations, indexes, triggers, users and much more. Free and Pro edition available.

- High user satsifaction on G2
- Visual query builder using drag and drop
- Query optimization with an explain plan feature
- Table data editing in spreadsheet
- Visual rendering of primary/foreign keys
- Simple navigation of database objects and their properties
- Flexible user interface in light and dark themes
- SQL formatting
- Command-line interface for headless execution
- Flexible SQL scripts execution with parameter support
- and more...

## Zing Data

<https://www.getzingdata.com/>

iOS, Android, Web

A native mobile app to visually query PostgreSQL databases (without having to write SQL), visualize results, view data tables, and collaborate with team mates using mentions and shared questions. Supports:SmartGraphs which automatically apply a visualization based on your query result (or can be changed)
Exporting graphs and CSVs of data tables on a mobile device
Collaboration tools, such as chat, @mentions, and shared dashboards
Support for long-running queries, where a user will get a push notification when the query is complete
Multiple data sources at one

Zing Data is available for free for the first ten users in an organization.

## PgManager

<http://www.ems-hitech.com/pgmanager>

Windows, Linux

Basically a proprietary, more powerful version of PGAdmin II or PGAccess. Adds support for trigger and constraint editing, metadata logging, and query monitoring. Also includes multiple-format data import/export tools, which are also available on their own for Linux. Developed by EMS Hitech. (JMB 4.2003).

## Valentina Studio (Free)

Windows/OS X/Linux/

Valentina Studio is a powerful PostgreSQL Database Server administration and development tool. It offers for free many advanced editors:

- Schema Editor with Tree and Column views
- Diagram Editor with reverse engineering
- SQL Editor with auto-completion, syntax-highlighting, recent and favorite queries, templates of commands, many result tab-panels, ...
- Data Editor with easy sorting and filtering of records without SQL, in-cell editing.
- Related Data Editor that allow s you to learn related records in different modes.
- Import/Export
- SQL dumps
- and so on ...

Valentina Studio PRO - adds additional advanced features as:

- Report Editor to developer reports based on Valentina Report Engine with datasources from PostgreSQL and other databases.
- Diagrams forward engineering
- SQL DIFF
- Data Transfer

## RazorSQL

<http://www.razorsql.com/>

Macintosh/Windows/Linux/Solaris

RazorSQL is an SQL query tool, database browser, SQL editor, and database administration tool that supports PostgreSQL and any other JDBC or ODBC compliant database. Some of the major features are tools for creating, dropping, and altering objects such as tables, views, indexes, triggers, functions, users, and databases; a programming editor that supports 20 different programming languages; import and export tools; auto column and table lookup; and a query builder, query scheduler, and SQL formatter.

## JetBrains IDEs - DataGrip, IntelliJ IDEA, PHPStorm, PyCharm, RubyMine, etc ...

<http://www.jetbrains.com/>

Windows, Mac OS X, Linux

JetBrains has a dedicated SQL IDE — DataGrip which can connect to PostgreSQL as well. It provides code completion, multi cursors, local query history, navigation, refactorings and language injection support. <https://www.jetbrains.com/datagrip/>

Other JetBrains Products, for example, PHPStorm, IDEA, have built-in database plugin, and it has the same functionality as DataGrip.

After you configured the data sources of your project, you can easily create tables, foreign keys, indexes much easier than usual, because the IDE is very smart; for example by foreign keys it automatically sets the name of the key and the related columns. For me, it is so far the best experience by creating a basic database schema. Even with editable EER models was it slower... By the settings of your data source you can configure the SQL dialect of your database. After that, if you want to add stored procedures or triggers, you will have code completion which is favorable too. So I think JetBrains products speed up your work if you exactly know what you want, and how can you make it.

For any JetBrains IDE, there is a free license for open source projects. For enterprise usage there is a 30 days trial, after that, you can buy a personal or proprietary license which is very cheap compared to other products.

## Aqua Data Studio

<https://www.aquafold.com/aquadatastudio>

Java: Windows/Linux/macOS/Solaris

Aqua Data Studio is a management tool for the PostgreSQL relational database w/ administration capabilities and a database query tool. The visual administration features provide users the ability to browse and modify database structures, including schema objects, database storage and maintain database security. An integrated query tool allows users to quickly create, edit and execute SQL queries and scripts. Aqua Data Studio also provides an import and export tool to allow users to easily move data in and out of the PostgreSQL database in and from different data formats.

## Navicat

<https://www.navicat.com/en/products/navicat-for-postgresql>

Windows, macOS, iOS, Linux

Navicat is a powerful PostgreSQL Database Server administration and development tool. It works with PostgreSQL 8.0 version or above and supports most of the PostgreSQL features including Trigger, Function, View, Manage User, and so on. It is also not only sophisticated enough for professional developers, but also easy to learn for new users. With its well-designed GUI, Navicat lets you quickly and easily create, organize, access and share information in a secure and easy way.

Version 15 introduces Smart Charts, a more powerful Data Transfer, Query Builder, New Data Modeling Tool, Dark Mode, and Native Linux support.

## Datazenit

<https://datazenit.com/>

Windows, Mac OS X, Linux

Datazenit is a cross-platform PostgreSQL and MySQL GUI with data grid, schema builder and interactive charts. It also has query builder, raw query editor with auto-complete, team collaboration features like connection, query and chart sharing among team members.

Available packaged as a desktop app.

## Quest Toad Edge

<https://www.quest.com/products/toad-edge/>

Windows & Mac OS X

PostgreSQL, MySQL and MariaDB support.

- Object and user management
- Code quality checks
- Database devops: Jenkins plug-in
- SQL query monitor
- Shema compare and sync
- Advanced JSON editor
- SQL worksheet
- Import/Export
- Database snapshot
- 24/7 support

## Kangaroo

<https://dbkangaroo.github.io/>

Supports SQLite 3.x, MySQL 8.0, MariaDB 10, PostgreSQL 11. Query, Editing, Designer, Export+Import = Full support. Hint, modeling and DB sync are on the roadmap. Windows, Linux, MacOS X

## DbSchema

<https://www.dbschema.com/>

windows/linux/OS X

A visual PostgreSQL designer and GUI client, featuring diagrams, schema design in a team, deployment on multiple databases, HTML5 documentation, and more.

- The schema structure is saved to a model file, which can be deployed on other databases or shared in a team
- HTML5 documentation with the diagram vector image
- Relational Data Explorer, with related data views from multiple tables
- Visual Query Builder
- Virtual foreign keys
- SQL Editor featuring text-autocompletion
- Random Data Generator, Data Loader, CSV Editor
- Support for multiple databases

DbSchema has a free and Pro version, which you can evaluate for 30 days.
WebDB (free)

[https://webdb.app](https://webdb.app/)

Free and efficient database IDE built with exclusive features like

- Easy Server Connection
- ERD Generator
- Intelligent data generator
- IA integration
- NoSQL structure inferring/editor

And Other features at the top of the market

- Many databases supported (MySQL, Postgre, MongoDB, etc)
- Powerful queries editor

Available on docker and all popular platform/arch

# macOS GUI Clients

Clients compatible with only OS X.

## Open Source and Completely Free Software

(empty list)

## Proprietary

Some of these have a "free" tier (typically somewhat crippled). Some are fully free.

## SQLPro for Postgres

<http://www.macpostgresclient.com/SQLProPostgres>

macOS 10.8 and above

Features:

- 100% native OS X app with a clean and simple to use interface.
- Query editor with syntax highlighting and autocomplete.
- Support for multiple result set execution.
- History feature, displaying your last ten executed queries.
- Primary key detection for inline result set modifications.
- Custom theme support allowing developers to work with style.

## TablePlus

<https://tableplus.com/>

A modern, native tool with an elegant UI that allows you to simultaneously manage multiple databases, including PostgreSQL. Available on macOS, Windows, and iOS.

- True native built.
- Workspace supports multiple tabs, multiple windows
- Powerful SQL editor with full features: auto syntax highlight, auto-suggestion, split pane, favorite and history.
- Data Filter & Sorting, import & export
- Full-dark theme & modern shortcut

With plugin system, you can be able to write your own new features to work with database per your needs (export charts, pretty json…).

## Postico

<https://eggerapps.at/postico/>

A nice native client by the developers of [Postgres.app](http://postgresapp.com/). A free "demo" version of an inexpensive proprietary app, but it has very reasonable limits ("only one tab") and no time limit.

Postico is a fully native Mac app for connecting to your PostgreSQL server. It supports encrypted connections via SSL and SSH to PostgreSQL 8.0 and later, including Amazon Redshift.

Postico has a powerful table content editor with in-cell editing and form-based row editing in a sidebar. You can quickly filter tables by keywords or even complex SQL expressions.

There's also a table structure editor for editing columns, types, default values, foreign keys, check constraints etc.

Finally, there's a convenient SQL Query Editor with support for query history and syntax highlighting. It also has convenience features like auto-indent and shortcuts for comment line etc.

## PSequel (free)

<http://www.psequel.com/>

OS X Yosemite+, free not crippled. Last update: 2018. Seems abandoned. Native OS X

## SEQUEL for PostgreSQL

[http://www.sequel.tech](http://www.sequel.tech/)

SEQUEL for PostgreSQL is a professional DB administration and management tool, with extremely intuitive and feature-rich GUI that makes it the best assistant tool for developers and admins. SEQUEL is lightweight, fast and powerful that it can significantly simplify the DB management process. For those who cannot live without a CLI, SEQUEL offers a powerful Query Editor with syntax highlight, autocomplete and a Console log view that is always visible, so you can monitor the communication with your databases. It includes:

- Database management forms for Schema, Table, Index, Foreign key, Trigger, Rule, Sequence, Collation, Domain, Enum type, Tablespace and Language objects with full parameters support
- Assistant info views for Object information, Actions, Help, and Documentation
- Jump bar for quick objects selection and navigation
- Taskbar with multi-task monitoring support
- Console log view
- Syntax highlight, autocomplete, current and selection query execution and explain, line numbering and working statement detection
- Direct editing in the results view, query results explanation
- Powerful Field editor
- Transaction based database updates
- Code preview and Content editing

# Windows GUI Clients

Clients compatible with only windows.
Open Source / Free Software

## HeidiSQL

<https://www.heidisql.com/> <https://github.com/HeidiSQL/HeidiSQL>

HeidiSQL is a lightweight Windows desktop application with support for PostgreSQL since 2015. Also supports MySQL, MariaDB, MS SQL Server and SQLite. HeidiSQL focuses on simple structure editing and grid based data editing, but also has some advanced features:

- Session management with folder support
- Multiple connections per window
- Browse through databases and tables, views, procedures and triggers
- Edit columns, indexes and foreign keys of tables
- Provides special editors for fields with various data types: text, date/time, enum, set, binary.
- Query tabs for running custom queries
- Completion proposal
- Displays multiple results per tab
- Keeps a history of executed queries
- SQL export directly to .sql file, another database, or to a different server
- Quick grid export for Excel, CSV, HTML, XML, LaTeX, Wiki markup, PHP, Markdown, JSON
- Search for text in a database, or on a whole server
- Import textfiles
- Reformat custom SQL queries

## Proprietary

## dbForge Studio for PostgreSQL

<https://www.devart.com/dbforge/postgresql/studio/download.html>

[dbForge Studio for PostgreSQL](https://www.devart.com/dbforge/postgresql/studio/) is all-in-one IDE designed for effective database development and management. The tasks that can be handled with its help include completion-aided SQL coding, comparison and synchronization of databases, data management, data analysis and reporting, query optimization, and test data generation.

### Key features:

- [SQL Development](https://www.devart.com/dbforge/postgresql/studio/postgresql-formatter.html): Increase the speed and quality of your coding with context-aware SQL completion, formatting, and syntax validation.
- [Database Comparison](https://www.devart.com/dbforge/postgresql/studio/database-synchronization.html): Compare database structures and table data; generate scripts to synchronize source and target databases.
- [Data Management](https://www.devart.com/dbforge/postgresql/studio/data-editor.html): View, edit, group, sort, filter, import, and export your data with convenience.
- [Test Data Generation](https://www.devart.com/dbforge/postgresql/studio/data-generator.html): Populate your databases with newly generated test data in a matter of moments.
- [Query Profiling](https://www.devart.com/dbforge/postgresql/studio/query-profiler.html): Identify and eliminate performance bottlenecks in slow queries.
- [Data Analysis & Reporting](https://www.devart.com/dbforge/postgresql/studio/postgresql-reporting-tools.html): Create pivot tables, visualize data trends and dependencies, and generate visual data reports.
- [Availability](https://www.devart.com/dbforge/postgresql/studio/getting-started.html#start-using): Run dbForge Studio on Windows, Linux, or macOS (the latter two options are enabled via a compatibility solution called CodeWeavers CrossOver).

## Database Tour Pro

[https://www.databasetour.net](https://www.databasetour.net/)

Database Tour Pro is a database tool with built-in report builder for Windows. It works with different types of relational databases including PostgreSQL.

### **Key features:**

- Creating tables.
- Viewing and editing data.
- Several ways to print data.
- Built-in report engine and visual report designer with templates, expressions, preview etc.
- Expression builder for report and export expressions.
- Building and executing SQL queries. Support for execution of multi statement SQL scripts. Syntax highlighting in SQL editor. Support for parameterized SQL queries.
- Enhanced database grids, which allow to view and manipulate the data in the most convenient way, including sorting by clicking column header, changing row heights, resizing columns etc.
- Command line support for executing queries, opening tables, export-import operations, loading reports etc. with logging the performed operations.
- Searching and replacing text in database with ability to choose fields, record range etc.
- Importing data to table from another table or a query.
- Exporting data from open table or query to file(s) like text, CSV, HTML, XLSX, XML, RTF, DBF or to another relational database of any supported type (i.e. ODBC, PostgreSQL, Oracle, SQL Server, dBase, Interbase, SQLite, MS Access, Firebird etc).
- Copying data to clipboard.
- Viewing and editing Blob data, such as large text and graphics.
- Tools for editing text fields (trimming, changing case of symbols, replacing text).
- Customized data view (font, background).
- Conditional formatting data in database grids and reports.
- Ability to control transactions.

## SQLGate

<https://www.sqlgate.com/product/download>

Windows

- SQLGate is a simple but powerful IDE for multiple Database including PostgreSQL.Powerful Data Grid and ERD
- Multiple SQL Execution
- Auto-Complete
- Intuitive UI/UX
- Multiple Themes
- Fast processing speed

Use SQLGate to maximize your productivity!

## Datazenit

<https://datazenit.com/>

Java

Datazenit is a cross-platform PostgreSQL and MySQL GUI with data grid, schema builder and interactive charts. It also has query builder, raw query editor with auto-complete, team collaboration features like connection, query and chart sharing among team members.

Web-based, but available packaged as a desktop app (linux, Mac, windows)

## EMS SQL Manager for PostgreSQL Freeware

<http://www.sqlmanager.net/en/tools/free>

EMS SQL Manager for PostgreSQL Freeware (EMS SQL Manager Lite for PostgreSQL) is an excellent and easy-to-use freeware graphical tool for PostgreSQL database administration. It has the minimal required set of tools for those users who are new to PostgreSQL server and need only its basic functionality. EMS SQL Manager for PostgreSQL Freeware allows you to work with servers, databases and schemas, view, edit, search, group, sort and filter any data stored in a database, create and execute SQL queries with powerful SQL editor, handle multiple selected objects at a time and much more.

There is a proprietary version available with significantly more functionality.

## PostgreSQL Maestro

<https://www.sqlmaestro.com/products/postgresql/maestro/>

Allows you to create, edit, copy, drop and dump database objects easy and fast. You can also design your database as ER diagram, build queries visually, execute SQL queries and scripts, debug PL/pgSQL functions, view and edit data including BLOBs, represent data as diagrams, export and import data to/from most popular file formats, analyze your data summarized into multidimensional views and hierarchies (OLAP cubes), manage PostgreSQL roles, users, groups and privileges, and use a lot of other admin tools designed for making your work with PostgreSQL database server comfortable and efficient.

## Nucleon Database Master

<http://nucleonsoftware.com/products/database-master>

Nucleon Database Master is a modern, powerful, intuitive, easy to use and all in one PostgreSQL MongoDB, Oracle, DB2, Informix, Ingres, SQL Server, SQL Azure, MySQL, FireBird, SQLite client application with a consistent interface that simplifies managing, querying, editing, visualizing, designing and reporting relational and schema-free (NoSQL) database systems. You can connect any database system via ODBC and OleDB connections.Using Database Master, you can execute SQL, LINQ, JSON queries or you can create, edit and delete all database objects such as tables, views, procedures, columns, indexes, collections, and triggers. You can execute SQL queries and scripts, view and edit table data including BLOBs (Image, Text or any file), represent tables and its relations as an ER(Entity Relationship) diagram.

## SQLPro

<http://www.vive.net/products/sqlpro.htm>

SqlPro is an easy to use database GUI tool for six popular databases (Oracle, MySQL, PostgreSQL, SQL Server, SQLite, and Access). One IDE makes database administration and development faster and error free. SQLPro Key Features: color-coding of the SQL, drag-and-drop of objects into the editor pane to save you from typing their names, retrieval of SQL code for things like stored procedures and triggers from the underlying database, and one-click creation of SELECT and INSERT statements. You can open, save and print SQL scripts. SQLPro uses native drivers to connect to the databases (no ODBC or third party engines to install).

## SQL Data Analysis

<https://www.yohz.com/sda_details.htm>

Windows

SQL Data Analysis is a business intelligence tool that helps you see and understand your PostgreSQL data.

- Connect to your PostgreSQL database, run your query, and visualize your data in seconds.
- Analyze your data with intuitive drag & drop interface. No programming, just insights.
- Cross database queries allow you to join a PostgreSQL data set with another database's data set (SQL Server, Oracle, MySQL, etc).
- Flexible layouts allow you to combine multiple data views to best visualize your data.
- Share and export your discoveries and insights to PDF, Excel, and HTML files.
- Multi database engine support - connect to SQL Server, Oracle, MySQL, MariaDB, SQLite, Access, and any ODBC-supported database

SQL Data Analysis helps you transform data into actionable insights. Free trial available at <https://www.yohz.com/sda_details.htm>

# Web Clients

Web clients run as a server on your desktop and you connect to them via a web browser. This also allows things like coworkers to connect as well. You can run SQL against servers and back the results (in your browser).

## Open Source

These are open source and free:

## phpPgAdmin

phpPgAdmin is a web-based administration tool for PostgreSQL. It is perfect for PostgreSQL DBAs, newbies, and hosting services.

<http://phppgadmin.sourceforge.net/doku.php>

## franchise

<https://franchise.cloud/>

Web client, either hosted (free) or running locally, connects to a local postgresql instance via a small bridge application.

Can share the interface with others, rather like sqlfiddle.com, but accessing your database.

## pgAdmin 4

<http://www.pgadmin.org/>

pgAdmin 4 is a ground-up rewrite of pgAdmin 3. Rather than being a native application it's primarily a web application that's also packaged as desktop web shell.

## Adminer

[http://www.adminer.org](http://www.adminer.org/)

PHP

Adminer (formerly phpMinAdmin) is a full-featured database management tool written in PHP. A single PHP file ready to deploy to the target server. Adminer is available for MySQL, PostgreSQL, SQLite, MS SQL and Oracle.

## OmniDB

<https://github.com/OmniDB/OmniDB>

Django/Python on Linux, Windows and macOS.

Open source full-featured tool for database management. Currently supports PostgreSQL (9.3 - 13), Oracle (11g - 18c), MySQL (5.6 - 8.0) and MariaDB (10.1 - 10.3). More RDBMS support coming soon, including the ability of converting databases from any supported RDBMS to PostgreSQL and back.

## SIDU

<http://topnew.net/sidu/>

PHP

Schema and data browser and editor.

## Hisha

<https://github.com/xshogi/hisha>

Node.js

Hisha is cross-platform and web-based Postgre SQL Database client inspired by Adminium. You can edit and save result by clicking the cell you want and press enter when you finish.

## Tadpole DB Hub

<https://github.com/hangum/TadpoleForDBTools/wiki>

Tadpole DB Hub is Unified infrastructure tool, a various environment based interface for managing Apache Hive, Amazon RDS, CUBRID, MariaDB, MySQL, Oracle, SQLite, MSSQL, PostgreSQL and MongoDB databases. It enables you to handle typical DB over the World Wide Web.

Features:

- Intuitive web interface (Safari, Chrome, IE 10, Firefox)
- User Management (Admin, Manager, User)
- Select, Insert, Update, Delete
- Download query result
- SQL Syntax Highlighting
- SQL Formatting
- SQL Statement <-> Java, PHP String Literal Each Convert
- SQL Assist
- Execute SQL Statement
- SQL Result Set to CSV
- SQL History And Export text
- Generate SQL Statement (Select, Insert, Update, Delete, Table, View, Index, Procedure, Function, Trigger)
- Generate ER Diagram (Auto Layout)

## Proprietary

Some may be pay, some may have free demo.

## Five

<https://five.co/>

Rapidly develop and deliver modern business software to internal or external users.

Five is free to use. Develop and test applications locally free of charge. Only subscribe when you build something production worthy.

Features:

- Store, retrieve and process data from any data source (such as a PostgreSQL DB)
- Rapidly implement business logic using SQL, JavaScript or TypeScript
- Cut down the time you spent on front-end development
- Scalable, secure and affordable: deploy apps in one click
- Keep your data secure on Five’s managed infrastructure
- Build password-protected multi-user applications
- Useful developer tools to accelerate your development

Free download available for Windows & MacOS

## TeamPostgreSQL

[http://www.teampostgresql.com](http://www.teampostgresql.com/)

browser-based, webserver included

AJAX/JavaScript-powered web interface for PostgreSQL administration. Browse, maintain and create data and database objects from anywhere, in the web browser. Supports SSH for both the web interface and the database connections. Rich interface with tabbed SQL editor with auto-completion, inline row-editing widgets, click-through foreign key navigation between rows and tables, 'favorites' management for commonly used scripts, and more.

Installers available for Windows, Mac and Linux, alternatively download a simple cross-platform archive that runs anywhere with simple script. Wasn't clear where source code is.

## JackDB

<http://www.jackdb.com/>

Html5 Web Browser (Linux/Mac OS X/Windows)

JackDB is a database client that runs entirely in your web browser. There's no software to install locally so you can use it on Mac OS X, Linux, and Windows and it works on all major modern browsers (eg. Chrome, Firefox, IE, Safari, and Opera). It supports connecting to PostgreSQL, as well as MySQL, Oracle, and SQL Server databases.

Features:

- Html5 interface with no client installation
- Query editor with syntax highlighting
- Scrolling result sets
- Schema/Object browser
- SSL connections with certificate pinning
- Eliminates password sharing
- Two-factor authentication
- BLOB display (images and Html5 audio/video)

## DBHawk

<http://www.datasparc.com/>

Web Browser (Linux/Mac OS X/Windows)

DBHawk is a web based SQL tool and reporting software designed for PostgreSQL, Oracle, SQL Server and other databases. Its easy to deploy and use.

Features:

- Web based interface with no client installation
- Advanced Query editor with syntax highlighting and multi tabs results
- Online visual query builder
- Online SQL Report Builder
- Online SQL Job Scheduler
- Export results to html, csv, pdf, google docs, amazon s3
- SQL Auditing and Security
- Schema/Object browser
- SQL and data snippet sharing
- Blob data viewer and editor

## Datazenit

<https://datazenit.com/>

Datazenit is a cross-platform PostgreSQL and MySQL GUI with data grid, schema builder and interactive charts. It also has query builder, raw query editor with auto-complete, team collaboration features like connection, query and chart sharing among team members.

Web-based, but available packaged as a desktop app (linux, Mac, windows)

# CLI Clients

Open Source / Free Software

## psql

<https://www.postgresql.org/docs/current/static/app-psql.html>

The standard command line client, maintained by the postgresql development group and typically distributed as part of the server installation.

## pgcli

[https://www.pgcli.com](https://www.pgcli.com/)

A command line client with syntax highlighting and pop-up command completion.

## jaqy

<https://teradata.github.io/jaqy/>

A universal JDBC command line client with lots of features. It is not specific to PostgreSQL, but it is pre-configured to handle PostgreSQL servers. Requires PostgreSQL JDBC driver.

# Other Resources

[Community Guide to PostgreSQL GUI Tools](https://wiki.postgresql.org/wiki/Community_Guide_to_PostgreSQL_GUI_Tools) - Includes many miscellaneous non-client tools, such as bulk loaders, schema diff, schema design, etc.

[Design Tools](https://wiki.postgresql.org/wiki/Design_Tools) - tools for designing database schemas

[List of drivers](https://wiki.postgresql.org/wiki/List_of_drivers)

Old possibly abandoned projects, see [Community\_Guide\_to\_PostgreSQL\_Tools\_Abandoned](https://wiki.postgresql.org/wiki/Community_Guide_to_PostgreSQL_Tools_Abandoned)

![](/assets/images/postgresql-clients/01-1c31be6e.png)
