-- Election Simulation - First Round
-- Insert 10 candidates and 100 users with vote distribution

-- Clear existing data (optional - uncomment if needed)
-- DELETE FROM Userss;
-- DELETE FROM Candidate;

-- Insert 10 candidates
INSERT INTO Candidate(name, party, image, description) VALUES
('John Smith', 'Democratic Party', 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?cs=srgb&dl=pexels-italo-melo-881954-2379004.jpg&fm=jpg', 'Experienced leader with a vision for economic reform and social justice'),
('Sarah Johnson', 'Republican Party', 'https://plus.unsplash.com/premium_photo-1661589836910-b3b0bf644bd5?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8cHJvZmVzc2lvbmFsJTIwYmxhY2slMjB3b21hbnxlbnwwfHwwfHx8MA%3D%3D', 'Conservative leader focused on economic growth and national security'),
('Michael Chen', 'Independent', 'https://t4.ftcdn.net/jpg/02/14/74/61/360_F_214746128_31JkeaP6rU0NzzzdFC4khGkmqc8noe6h.jpg', 'Innovation-focused candidate bridging political divides'),
('Maria Rodriguez', 'Green Party', 'https://img.freepik.com/free-photo/young-beautiful-woman-pink-warm-sweater-natural-look-smiling-portrait-isolated-long-hair_285396-896.jpg', 'Environmental advocate with progressive social policies'),
('David Wilson', 'Democratic Party', 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', 'Healthcare reform champion with 20 years of public service'),
('Lisa Thompson', 'Republican Party', 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', 'Business leader advocating for tax cuts and deregulation'),
('Robert Kim', 'Independent', 'https://images.pexels.com/photos/927022/pexels-photo-927022.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', 'Technology entrepreneur focused on digital transformation'),
('Emily Davis', 'Green Party', 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', 'Climate scientist pushing for renewable energy policies'),
('James Brown', 'Democratic Party', 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', 'Education reform advocate with focus on public schools'),
('Amanda White', 'Republican Party', 'https://images.pexels.com/photos/1181687/pexels-photo-1181687.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', 'Law enforcement veteran promoting public safety policies');

-- Insert 100 users with vote distribution
-- 97 users with votes, 3 users without votes (for testing)

-- Users voting for John Smith (15 votes)
INSERT INTO Userss(cnp, name, vote) VALUES
(1001, 'Alice Johnson', 1), (1002, 'Bob Smith', 1), (1003, 'Carol Davis', 1), (1004, 'David Wilson', 1), (1005, 'Eva Brown', 1),
(1006, 'Frank Miller', 1), (1007, 'Grace Lee', 1), (1008, 'Henry Taylor', 1), (1009, 'Iris Garcia', 1), (1010, 'Jack Martinez', 1),
(1011, 'Kate Anderson', 1), (1012, 'Liam Thompson', 1), (1013, 'Mia Rodriguez', 1), (1014, 'Noah Lewis', 1), (1015, 'Olivia Clark', 1);

-- Users voting for Sarah Johnson (18 votes)
INSERT INTO Userss(cnp, name, vote) VALUES
(1016, 'Paul Walker', 2), (1017, 'Quinn Hall', 2), (1018, 'Rachel Young', 2), (1019, 'Sam Allen', 2), (1020, 'Tina King', 2),
(1021, 'Uma Scott', 2), (1022, 'Victor Green', 2), (1023, 'Wendy Baker', 2), (1024, 'Xavier Adams', 2), (1025, 'Yara Nelson', 2),
(1026, 'Zoe Carter', 2), (1027, 'Adam Mitchell', 2), (1028, 'Bella Perez', 2), (1029, 'Carlos Roberts', 2), (1030, 'Diana Turner', 2),
(1031, 'Ethan Phillips', 2), (1032, 'Fiona Campbell', 2), (1033, 'George Parker', 2);

-- Users voting for Michael Chen (12 votes)
INSERT INTO Userss(cnp, name, vote) VALUES
(1034, 'Hannah Evans', 3), (1035, 'Ian Edwards', 3), (1036, 'Julia Collins', 3), (1037, 'Kevin Stewart', 3), (1038, 'Laura Morris', 3),
(1039, 'Mark Rogers', 3), (1040, 'Nina Reed', 3), (1041, 'Oscar Cook', 3), (1042, 'Paula Morgan', 3), (1043, 'Quentin Bell', 3),
(1044, 'Rita Murphy', 3), (1045, 'Steve Bailey', 3);

-- Users voting for Maria Rodriguez (10 votes)
INSERT INTO Userss(cnp, name, vote) VALUES
(1046, 'Tracy Cooper', 4), (1047, 'Ulysses Richardson', 4), (1048, 'Vera Cox', 4), (1049, 'Walter Howard', 4), (1050, 'Xena Ward', 4),
(1051, 'Yves Torres', 4), (1052, 'Zara Peterson', 4), (1053, 'Aaron Gray', 4), (1054, 'Betty James', 4), (1055, 'Charlie Watson', 4);

-- Users voting for David Wilson (14 votes)
INSERT INTO Userss(cnp, name, vote) VALUES
(1056, 'Diana Brooks', 5), (1057, 'Evan Kelly', 5), (1058, 'Fiona Sanders', 5), (1059, 'Gary Price', 5), (1060, 'Holly Bennett', 5),
(1061, 'Ivan Wood', 5), (1062, 'Janet Barnes', 5), (1063, 'Keith Ross', 5), (1064, 'Lily Henderson', 5), (1065, 'Mason Coleman', 5),
(1066, 'Nora Jenkins', 5), (1067, 'Oscar Perry', 5), (1068, 'Penny Powell', 5), (1069, 'Quincy Long', 5);

-- Users voting for Lisa Thompson (16 votes)
INSERT INTO Userss(cnp, name, vote) VALUES
(1070, 'Ruby Patterson', 6), (1071, 'Sam Hughes', 6), (1072, 'Tina Flores', 6), (1073, 'Ulysses Butler', 6), (1074, 'Vera Simmons', 6),
(1075, 'Wade Foster', 6), (1076, 'Xena Gonzales', 6), (1077, 'Yves Bryant', 6), (1078, 'Zara Alexander', 6), (1079, 'Aaron Russell', 6),
(1080, 'Betty Griffin', 6), (1081, 'Charlie Diaz', 6), (1082, 'Diana Hayes', 6), (1083, 'Evan Myers', 6), (1084, 'Fiona Ford', 6),
(1085, 'Gary Hamilton', 6);

-- Users voting for Robert Kim (8 votes)
INSERT INTO Userss(cnp, name, vote) VALUES
(1086, 'Holly Graham', 7), (1087, 'Ivan Sullivan', 7), (1088, 'Janet Wallace', 7), (1089, 'Keith Woods', 7), (1090, 'Lily Cole', 7),
(1091, 'Mason West', 7), (1092, 'Nora Jordan', 7), (1093, 'Oscar Owens', 7);

-- Users voting for Emily Davis (9 votes)
INSERT INTO Userss(cnp, name, vote) VALUES
(1094, 'Penny Banks', 8), (1095, 'Quincy Ortiz', 8), (1096, 'Ruby Gardner', 8), (1097, 'Sam Stephens', 8), (1098, 'Tina Tucker', 8),
(1099, 'Ulysses Porter', 8), (1100, 'Vera Hunter', 8), (1101, 'Wade Hicks', 8), (1102, 'Xena Crawford', 8);

-- Users voting for James Brown (7 votes)
INSERT INTO Userss(cnp, name, vote) VALUES
(1103, 'Yves Henry', 9), (1104, 'Zara Boyd', 9), (1105, 'Aaron Mason', 9), (1106, 'Betty Morales', 9), (1107, 'Charlie Kennedy', 9),
(1108, 'Diana Warren', 9), (1109, 'Evan Dixon', 9);

-- Users voting for Amanda White (6 votes)
INSERT INTO Userss(cnp, name, vote) VALUES
(1110, 'Fiona Ramos', 10), (1111, 'Gary Reeves', 10), (1112, 'Holly Gordon', 10), (1113, 'Ivan Lane', 10), (1114, 'Janet Freeman', 10),
(1115, 'Keith Shaw', 10);

-- 3 users without votes (for testing the voting functionality)
INSERT INTO Userss(cnp, name, vote) VALUES
(1116, 'Lily Wells', NULL), (1117, 'Mason Reynolds', NULL), (1118, 'Nora Fisher', NULL);

-- Verify the data
SELECT 'Candidates:' as info;
SELECT id, name, party FROM Candidate ORDER BY id;

SELECT 'Vote Distribution:' as info;
SELECT c.name, c.party, COUNT(u.cnp) as vote_count
FROM Candidate c
LEFT JOIN Userss u ON c.id = u.vote
GROUP BY c.id, c.name, c.party
ORDER BY vote_count DESC;

SELECT 'Users without votes:' as info;
SELECT cnp, name FROM Userss WHERE vote IS NULL; 